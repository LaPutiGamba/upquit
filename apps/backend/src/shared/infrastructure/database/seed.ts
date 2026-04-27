import "dotenv/config";
import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";
import { sql } from "drizzle-orm";
import { db } from "./connection.js";
import {
  boardMembers,
  boards,
  categories,
  comments,
  giveToGetProgress,
  requestCategories,
  requestChangelogs,
  requests,
  subscriptions,
  users,
  votes
} from "./schema.js";

type SeedIds = {
  users: {
    admin: string;
    alice: string;
    bob: string;
    arian: string;
    dave: string;
  };
  boards: {
    launchPad: string;
    internalRoadmap: string;
  };
  categories: {
    ideas: string;
    bugs: string;
    ux: string;
    operations: string;
    mobile: string;
  };
  requests: {
    keyboardShortcuts: string;
    mobileNavigation: string;
    ssoSupport: string;
    darkModePolish: string;
  };
  comments: {
    launchPadRoot: string;
    launchPadReply: string;
    mobileNavigationRoot: string;
    ssoSupportRoot: string;
  };
  votes: {
    keyboardShortcutsBob: string;
    keyboardShortcutsArian: string;
    mobileNavigationAlice: string;
    ssoSupportArian: string;
  };
};

const createSeedIds = (): SeedIds => ({
  users: {
    admin: randomUUID(),
    alice: randomUUID(),
    bob: randomUUID(),
    arian: randomUUID(),
    dave: randomUUID()
  },
  boards: {
    launchPad: randomUUID(),
    internalRoadmap: randomUUID()
  },
  categories: {
    ideas: randomUUID(),
    bugs: randomUUID(),
    ux: randomUUID(),
    operations: randomUUID(),
    mobile: randomUUID()
  },
  requests: {
    keyboardShortcuts: randomUUID(),
    mobileNavigation: randomUUID(),
    ssoSupport: randomUUID(),
    darkModePolish: randomUUID()
  },
  comments: {
    launchPadRoot: randomUUID(),
    launchPadReply: randomUUID(),
    mobileNavigationRoot: randomUUID(),
    ssoSupportRoot: randomUUID()
  },
  votes: {
    keyboardShortcutsBob: randomUUID(),
    keyboardShortcutsArian: randomUUID(),
    mobileNavigationAlice: randomUUID(),
    ssoSupportArian: randomUUID()
  }
});

export async function seedDatabase() {
  const ids = createSeedIds();
  const passwordHash = await bcrypt.hash("12345678", 12);

  await db.transaction(async (tx) => {
    await tx.execute(sql`
      TRUNCATE TABLE
        "request_changelogs",
        "subscriptions",
        "votes",
        "comments",
        "request_categories",
        "give_to_get_progress",
        "board_members",
        "requests",
        "categories",
        "boards",
        "users"
      RESTART IDENTITY CASCADE
    `);

    await tx.insert(users).values([
      {
        id: ids.users.admin,
        email: "admin@upquit.test",
        displayName: "UpQuit Admin",
        avatarUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12",
        emailVerified: true,
        passwordHash,
        isActive: true
      },
      {
        id: ids.users.alice,
        email: "alice@upquit.test",
        displayName: "Alice Rivera",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
        emailVerified: true,
        passwordHash,
        isActive: true
      },
      {
        id: ids.users.bob,
        email: "bob@upquit.test",
        displayName: "Bob Chen",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
        emailVerified: true,
        passwordHash,
        isActive: true
      },
      {
        id: ids.users.arian,
        email: "arian_aragonferriz@iescarlesvallbona.cat",
        displayName: "Arià Aragón",
        avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
        emailVerified: true,
        passwordHash,
        isActive: true
      },
      {
        id: ids.users.dave,
        email: "dave@upquit.test",
        displayName: "Dave Patel",
        avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
        emailVerified: false,
        passwordHash,
        isActive: true
      }
    ]);

    await tx.insert(boards).values([
      {
        id: ids.boards.launchPad,
        slug: "launch-pad",
        name: "Launch Pad",
        description: "Public feedback board for the main product.",
        logoUrl: "https://images.unsplash.com/photo-1495020689067-958852a7765e",
        primaryColor: "#3b82f6",
        ownerId: ids.users.alice,
        isPublic: true,
        allowAnonymousVotes: true,
        giveToGetEnabled: true,
        giveToGetVotesReq: 2,
        giveToGetCommentsReq: 1
      },
      {
        id: ids.boards.internalRoadmap,
        slug: "internal-roadmap",
        name: "Internal Roadmap",
        description: "Private planning board used by the core team.",
        logoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
        primaryColor: "#0f766e",
        ownerId: ids.users.bob,
        isPublic: false,
        allowAnonymousVotes: false,
        giveToGetEnabled: true,
        giveToGetVotesReq: 3,
        giveToGetCommentsReq: 2
      }
    ]);

    await tx.insert(boardMembers).values([
      { userId: ids.users.alice, boardId: ids.boards.launchPad, role: "owner" },
      { userId: ids.users.bob, boardId: ids.boards.launchPad, role: "member" },
      { userId: ids.users.arian, boardId: ids.boards.launchPad, role: "member" },
      { userId: ids.users.bob, boardId: ids.boards.internalRoadmap, role: "owner" },
      { userId: ids.users.alice, boardId: ids.boards.internalRoadmap, role: "member" },
      { userId: ids.users.dave, boardId: ids.boards.internalRoadmap, role: "member" }
    ]);

    await tx.insert(categories).values([
      { id: ids.categories.ideas, boardId: ids.boards.launchPad, name: "Ideas" },
      { id: ids.categories.bugs, boardId: ids.boards.launchPad, name: "Bugs" },
      { id: ids.categories.ux, boardId: ids.boards.launchPad, name: "UX" },
      { id: ids.categories.operations, boardId: ids.boards.internalRoadmap, name: "Operations" },
      { id: ids.categories.mobile, boardId: ids.boards.internalRoadmap, name: "Mobile" }
    ]);

    await tx.insert(requests).values([
      {
        id: ids.requests.keyboardShortcuts,
        boardId: ids.boards.launchPad,
        authorId: ids.users.arian,
        title: "Add keyboard shortcuts",
        description: "Let power users navigate the app without reaching for the mouse.",
        status: "open",
        voteCount: 2,
        isPinned: true,
        isHidden: false
      },
      {
        id: ids.requests.mobileNavigation,
        boardId: ids.boards.launchPad,
        authorId: ids.users.dave,
        title: "Improve mobile navigation",
        description: "Use a more compact navigation pattern on small screens.",
        status: "planned",
        voteCount: 1,
        isPinned: false,
        isHidden: false
      },
      {
        id: ids.requests.ssoSupport,
        boardId: ids.boards.internalRoadmap,
        authorId: ids.users.bob,
        title: "Add SSO support",
        description: "Support enterprise logins with Google and Microsoft providers.",
        status: "in_progress",
        voteCount: 4,
        isPinned: true,
        isHidden: false,
        adminNote: "Validate against the enterprise rollout checklist before release."
      },
      {
        id: ids.requests.darkModePolish,
        boardId: ids.boards.internalRoadmap,
        authorId: ids.users.alice,
        title: "Polish dark mode states",
        description: "Tighten contrast and hover states across the dark theme.",
        status: "completed",
        voteCount: 6,
        isPinned: false,
        isHidden: false
      }
    ]);

    await tx.insert(requestCategories).values([
      { requestId: ids.requests.keyboardShortcuts, categoryId: ids.categories.ideas },
      { requestId: ids.requests.keyboardShortcuts, categoryId: ids.categories.ux },
      { requestId: ids.requests.mobileNavigation, categoryId: ids.categories.bugs },
      { requestId: ids.requests.mobileNavigation, categoryId: ids.categories.ux },
      { requestId: ids.requests.ssoSupport, categoryId: ids.categories.operations },
      { requestId: ids.requests.ssoSupport, categoryId: ids.categories.ideas },
      { requestId: ids.requests.darkModePolish, categoryId: ids.categories.mobile }
    ]);

    await tx.insert(subscriptions).values([
      { userId: ids.users.alice, requestId: ids.requests.keyboardShortcuts },
      { userId: ids.users.bob, requestId: ids.requests.keyboardShortcuts },
      { userId: ids.users.arian, requestId: ids.requests.mobileNavigation },
      { userId: ids.users.dave, requestId: ids.requests.ssoSupport },
      { userId: ids.users.admin, requestId: ids.requests.darkModePolish }
    ]);

    await tx.insert(comments).values([
      {
        id: ids.comments.launchPadRoot,
        requestId: ids.requests.keyboardShortcuts,
        userId: ids.users.admin,
        content: "This is a strong fit for the public roadmap and should improve power-user retention.",
        isAdminReply: true
      },
      {
        id: ids.comments.launchPadReply,
        requestId: ids.requests.keyboardShortcuts,
        userId: ids.users.arian,
        parentId: ids.comments.launchPadRoot,
        content: "I can help test the shortcut map once it is wired up.",
        isAdminReply: false
      },
      {
        id: ids.comments.mobileNavigationRoot,
        requestId: ids.requests.mobileNavigation,
        userId: ids.users.bob,
        content: "We can probably collapse the nav into a bottom sheet on phones.",
        isAdminReply: false
      },
      {
        id: ids.comments.ssoSupportRoot,
        requestId: ids.requests.ssoSupport,
        userId: ids.users.alice,
        content: "Enterprise buyers have asked for this repeatedly; let us keep the scope focused.",
        isAdminReply: false
      }
    ]);

    await tx.insert(votes).values([
      {
        id: ids.votes.keyboardShortcutsBob,
        requestId: ids.requests.keyboardShortcuts,
        userId: ids.users.bob,
        boardId: ids.boards.launchPad
      },
      {
        id: ids.votes.keyboardShortcutsArian,
        requestId: ids.requests.keyboardShortcuts,
        userId: ids.users.arian,
        boardId: ids.boards.launchPad
      },
      {
        id: ids.votes.mobileNavigationAlice,
        requestId: ids.requests.mobileNavigation,
        userId: ids.users.alice,
        boardId: ids.boards.launchPad
      },
      {
        id: ids.votes.ssoSupportArian,
        requestId: ids.requests.ssoSupport,
        userId: ids.users.arian,
        boardId: ids.boards.internalRoadmap
      }
    ]);

    await tx.insert(giveToGetProgress).values([
      {
        userId: ids.users.alice,
        boardId: ids.boards.launchPad,
        votesGiven: 1,
        qualifyingComments: 0,
        canPost: false
      },
      {
        userId: ids.users.bob,
        boardId: ids.boards.launchPad,
        votesGiven: 1,
        qualifyingComments: 1,
        canPost: false
      },
      {
        userId: ids.users.arian,
        boardId: ids.boards.launchPad,
        votesGiven: 1,
        qualifyingComments: 1,
        canPost: false
      },
      {
        userId: ids.users.alice,
        boardId: ids.boards.internalRoadmap,
        votesGiven: 0,
        qualifyingComments: 1,
        canPost: false
      },
      {
        userId: ids.users.bob,
        boardId: ids.boards.internalRoadmap,
        votesGiven: 0,
        qualifyingComments: 0,
        canPost: false
      },
      {
        userId: ids.users.arian,
        boardId: ids.boards.internalRoadmap,
        votesGiven: 1,
        qualifyingComments: 0,
        canPost: false
      },
      {
        userId: ids.users.dave,
        boardId: ids.boards.internalRoadmap,
        votesGiven: 1,
        qualifyingComments: 0,
        canPost: false
      }
    ]);

    await tx.insert(requestChangelogs).values([
      {
        requestId: ids.requests.keyboardShortcuts,
        userId: ids.users.admin,
        field: "status",
        oldValue: "planned",
        newValue: "open"
      },
      {
        requestId: ids.requests.mobileNavigation,
        userId: ids.users.bob,
        field: "title",
        oldValue: "Make mobile navigation easier to use",
        newValue: "Improve mobile navigation"
      },
      {
        requestId: ids.requests.ssoSupport,
        userId: ids.users.alice,
        field: "status",
        oldValue: "open",
        newValue: "in_progress"
      }
    ]);
  });

  return ids;
}

const run = async () => {
  try {
    await seedDatabase();
    console.log("Database seeded successfully.");
  } catch (error) {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  }
};

const isMainModule = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;

if (isMainModule) {
  void run();
}
