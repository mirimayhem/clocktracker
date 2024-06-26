<template>
  <div class="flex relative">
    <nav
      class="flex flex-col gap-3 p-2 rounded md:rounded-none rounded-l-none md:pb-0 fixed md:sticky top-0 md:h-screen bg-stone-400 dark:bg-stone-900 md:w-[175px] md:min-w-[175px] z-50 min-w-[42px] min-h-[42px]"
      :class="{
        'h-screen w-screen': showMenu,
      }"
    >
      <button
        id="show-navbar"
        @click="showMenu = !showMenu"
        class="md:hidden absolute top-1 left-1"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 32 32"
        >
          <path
            fill="currentColor"
            d="M4 6h24v2H4zm0 18h24v2H4zm0-12h24v2H4zm0 6h24v2H4z"
          />
        </svg>
      </button>
      <section
        class="h-full pb-3"
        :class="{
          'hidden md:flex flex-col items-center': !showMenu,
          'flex flex-col items-center': showMenu,
        }"
      >
        <nuxt-link
          id="clocktracker-icon"
          to="/"
          class="flex items-center gap-4"
        >
          <img
            src="/logo-ct-sm.png"
            class="w-[75px] rounded-full"
            alt="ClockTracker"
          />
        </nuxt-link>
        <template v-if="user">
          <NavLink id="my-profile" to="/" icon="innkeeper">
            <template v-if="featureFlags.isEnabled('dashboard')">
              Dashboard
            </template>
            <template v-else>My Profile</template>
          </NavLink>
          <NavLink id="search" to="/search" icon="investigator">
            Search
          </NavLink>
          <NavLink id="add-game" to="/add-game" icon="mezepheles">
            Add Game
          </NavLink>
          <NavLink
            id="friends"
            to="/friends"
            icon="eviltwin"
            :notificationCount="friends.getRequestCount(user.id)"
          >
            Friends
          </NavLink>
          <NavLink id="communities" to="/community" icon="cultleader">
            Communities
          </NavLink>
          <NavLink id="events" to="/events" icon="mutant"> Events </NavLink>
          <NavLink id="settings" to="/settings" icon="tinker">
            Settings
          </NavLink>
          <NavLink to="/logout" icon="steward"> Logout </NavLink>
        </template>
        <template v-else>
          <NavLink id="home" to="/" icon="innkeeper">
            Home
          </NavLink>
          <NavLink id="search" to="/search" icon="investigator">
            Search
          </NavLink>
          <NavLink to="/login" icon="steward"> Login </NavLink>
        </template>
        <div class="py-4 md:flex-grow" />
        <div class="flex flex-col gap-4 items-center">
          <div v-if="dark !== null" class="flex gap-2 items-center">
            ☀️
            <Toggle v-model="dark" size="sm" />
            🌙
          </div>
          <div class="flex justify-around">
            <a
              id="discord"
              href="https://discord.gg/KwMz8ThamT"
              class="text-stone-200 hover:text-stone-300 dark:text-stone-200 dark:hover:text-stone-100 hover:underline flex gap-2 items-center whitespace-nowrap w-full py-1"
              aria-label="Join the ClockTracker Discord server"
            >
              <div class="w-[50px] flex justify-center">
                <Discord />
              </div>
            </a>
            <a
              id="kofi"
              href="https://ko-fi.com/clocktracker"
              class="text-stone-200 hover:text-stone-300 dark:text-stone-200 dark:hover:text-stone-100 hover:underline flex gap-2 items-center whitespace-nowrap w-full py-1"
              aria-label="Donate to ClockTracker"
            >
              <div class="w-[50px] flex justify-center">
                <KoFi />
              </div>
            </a>
            <a
              href="https://github.com/lindsaykwardell/clocktracker"
              class="text-stone-200 hover:text-stone-300 dark:text-stone-200 dark:hover:text-stone-100 hover:underline flex gap-2 items-center whitespace-nowrap w-full py-1"
              aria-label="View the ClockTracker source code"
            >
              <div class="w-[50px] flex justify-center">
                <Github />
              </div>
            </a>
          </div>
        </div>
      </section>
    </nav>
    <main class="flex-grow">
      <!-- <div
        v-if="isInMaintenanceWindow"
        class="bg-purple-400 dark:bg-purple-950 p-2 min-h-[42px]"
      >
        <p class="ml-[42px] md:ml-0">
          We are performing maintenance on our server. During this time, you may
          experience some downtime. Please see our Discord community for
          updates.
        </p>
      </div> -->
      <slot />
    </main>
  </div>
  <Tour
    v-if="user"
    :steps="tour"
    @onTourEnd="showMenu = false"
    tourKey="new-community-nav-item"
  />
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const user = useSupabaseUser();
const friends = useFriends();
const featureFlags = useFeatureFlags();

const showMenu = ref(false);
const maintenanceStart = dayjs.tz(
  "2024-04-29T00:00:00Z",
  "America/Los_Angeles"
);
const maintenanceEnd = maintenanceStart.add(24, "hours");
const now = new Date();

const isInMaintenanceWindow = computed(() => {
  return now >= maintenanceStart.toDate() && now <= maintenanceEnd.toDate();
});

const dark = ref<boolean | null>(null);

watch(dark, () => {
  if (dark.value) {
    useDarkMode();
  } else {
    useLightMode();
  }
});

onMounted(() => {
  dark.value = themeIsDark();
});

const tour: Step[] = [
  {
    target: "#clocktracker-icon",
    content:
      "Welcome to ClockTracker! You can see your friends, communities, and games here. Let's walk through some of the features available to you.",
    onNext: () => {
      showMenu.value = true;
    },
  },
  {
    target: "#my-profile",
    content:
      "This is your profile. You can see your recorded games and personalized stats here.",
  },
  {
    target: "#search",
    content:
      "You can search for users and communities, and connect with the people that you play with.",
  },
  {
    target: "#add-game",
    content:
      "You can add a game and record as much or as little data about your playthrough as you would like. You can use the base scripts, one of the community scripts, or just add whatever characters you want from a custom script.",
  },
  {
    target: "#friends",
    content:
      "You can see your friends here. You can also see friend requests and send friend requests.",
  },
  {
    target: "#communities",
    content:
      "Communities are another way to connect. You can create a community and invite your friends to join. Once you have a community, you can create and manage events, and see what scripts you've all been playing.",
  },
  {
    target: "#events",
    content:
      "Events that you are registered for can be viewed here. If you're looking for an event, check our your community's events page.",
  },
  {
    target: "#settings",
    content:
      "You can change your settings here. You can change your display name, username, password, as well as connect ClockTracker to sites like BoardGameGeek.",
  },
  {
    target: "#discord",
    content:
      "You can join the ClockTracker Discord server here. You can ask questions, report bugs, or just chat with other ClockTracker users.",
  },
  {
    target: "#kofi",
    content:
      "If you find ClockTracker valuable, you can donate to support us on Ko-Fi. Donations help keep the site running and are greatly appreciated.",
  },
  {
    target: "#anchor-center",
    content:
      "That's it! You're ready to start using ClockTracker. If you have any questions, feel free to reach out on Discord.",
  },
];
</script>
