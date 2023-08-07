import { defineStore } from "pinia";
import { FetchStatus } from "./useFetchStatus";
import type { Game, Character, Grimoire, Token } from "@prisma/client";

export type FullCharacter = Character & {
  role?: {
    token_url: string;
    type: string;
    initial_alignment: "GOOD" | "EVIL" | "NEUTRAL";
  };
  related_role?: { token_url: string };
};

export type GameRecord = Game & {
  player_characters: FullCharacter[];
  grimoire: (Grimoire & {
    tokens: (Token & {
      role?: {
        token_url: string;
        type: string;
        initial_alignment: "GOOD" | "EVIL" | "NEUTRAL";
      };
      related_role?: { token_url: string };
    })[];
  })[];
};

export type RecentGameRecord = GameRecord & {
  user: {
    user_id: string;
    username: string;
    display_name: string;
    avatar: string | null;
    pronouns: string | null;
    location: string | null;
  };
};

export const useGames = defineStore("games", {
  state: () => ({
    games: new Map<string, FetchStatus<GameRecord>>(),
    players: new Map<string, FetchStatus<boolean>>(),
  }),
  getters: {
    getGame(): (gameId: string) => FetchStatus<GameRecord> {
      return (gameId: string) => {
        return this.games.get(gameId) || { status: Status.IDLE };
      };
    },
    getByPlayer(): (username: string) => FetchStatus<GameRecord[]> {
      return (username: string) => {
        const users = useUsers();
        const user = users.getUser(username);
        if (user.status !== Status.SUCCESS) return user;
        const user_id = user.data.user_id;

        const playerStatus = this.players.get(username);
        if (!playerStatus) return { status: Status.IDLE };

        if (playerStatus.status !== Status.SUCCESS) return playerStatus;

        const games: GameRecord[] = [];
        for (const [_, gameStatus] of this.games) {
          if (gameStatus.status === Status.SUCCESS) {
            const game = gameStatus.data;
            if (game.user_id === user_id) {
              games.push(game);
            }
          }
        }

        return { status: Status.SUCCESS, data: games };
      };
    },
    getLastCharater(): (gameId: string) => FullCharacter {
      return (gameId: string) => {
        console.log(gameId);
        const dummyCharacter: FullCharacter = {
          id: 0,
          name: "",
          alignment: "NEUTRAL",
          related: null,
          game_id: gameId,
          role_id: null,
          related_role_id: null,
        };

        const game = this.games.get(gameId);
        if (!game || game.status !== Status.SUCCESS) return dummyCharacter;

        if (game.data.is_storyteller) {
          return {
            ...dummyCharacter,
            name: "STORYTELLER",
            role: {
              token_url: "/img/role/storyteller.png",
              initial_alignment: "NEUTRAL",
              type: "STORYTELLER",
            },
          };
        }

        const characters = game.data.player_characters;
        if (characters.length === 0) return dummyCharacter;

        return characters[characters.length - 1];
      };
    },
  },
  actions: {
    async fetchGame(gameId: string) {
      // Mark as loading if we don't have the user yet
      if (!this.games.has(gameId))
        this.games.set(gameId, { status: Status.LOADING });

      // Fetch the user
      const game = await $fetch<GameRecord>(`/api/games/${gameId}`);

      // Otherwise, mark as success
      this.games.set(gameId, {
        status: Status.SUCCESS,
        data: game,
      });
    },
    async fetchPlayerGames(userId: string) {
      if (!this.players.has(userId))
        this.players.set(userId, { status: Status.LOADING });

      const games = await $fetch<GameRecord[]>(`/api/user/${userId}/games`);

      this.players.set(userId, { status: Status.SUCCESS, data: true });

      for (const game of games) {
        this.games.set(game.id, {
          status: Status.SUCCESS,
          data: game,
        });
      }
    },
  },
});
