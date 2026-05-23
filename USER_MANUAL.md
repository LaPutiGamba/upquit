# UpQuit User Manual: Navigation Guide

Welcome to UpQuit! This guide will help you understand how to navigate through the application screens, from your first visit to managing your own boards.

## 1. Public Pages (Unauthenticated)

### 1.1 Landing Page (`/`)
- **Description:** The marketing homepage explaining UpQuit's features.
- **Navigation:** From here, you can click on the **Login** or **Register** buttons located in the top navigation bar to access your account or create a new one.

### 1.2 Registration & Login (`/register` & `/login`)
- **Description:** Clean, focused screens for authentication. 
- **Navigation:** 
  - Fill out your credentials or click "Continue with Google".
  - After a successful login, you will be automatically redirected to your **Boards Dashboard**.
  - If registering, you will be redirected to the **Verify Email** screen (`/verify-email`) and then must click the link sent to your inbox.

---

## 2. Main Application (Authenticated)

### 2.1 Boards Dashboard (`/boards`)
- **Description:** The central hub where you see all your personal boards and the boards you have joined.
- **Navigation:** 
  - Click on any **Board Card** to enter that specific board.
  - Click the **"Create Board"** button to start a new board.
  - Navigate to the **"Discover"** tab in the page header to find public boards (`/boards/discover`).
  - At the top right, click the **Notification Bell** to see your recent alerts (`/notifications`).
  - Click your **User Profile Avatar** to open the settings dropdown and log out.

### 2.2 Discover Boards (`/boards/discover`)
- **Description:** A searchable list of public UpQuit boards.
- **Navigation:** Use the search bar to find boards, and click **"Join"** or click on a board's name to view its public feature requests.

---

## 3. Inside a Board

When you click on a board from your dashboard, you enter the **Board View** (`/board/[slug]`). The layout changes to include a persistent sidebar for board-specific navigation.

### 3.1 Board Sidebar Navigation
The left sidebar contains the main navigation for the current board:
- **Dashboard (`/board/[slug]`):** Overview of the board.
- **Requests (`/board/[slug]/requests`):** The list of feature requests, bugs, and ideas. You can filter these by status (e.g., Open, Planned, Completed) or categories.
- **Team (`/board/[slug]/members`):** *Admin only.* Manage board members, invite new team members, and adjust roles.
- **Settings (`/board/[slug]/settings`):** *Admin only.* Configure the board's name, logo, privacy settings, and Give-to-Get requirements.

### 3.2 Feature Requests (`/board/[slug]/requests`)
- **Description:** The core of the board where users submit and vote on feedback.
- **Navigation:**
  - Click **"New Request"** to open the submission form.
  - Click the **Upvote button** next to a request to support it.
  - Click on a **Request Title** to enter the **Request Detail Page** (`/board/[slug]/request/[id]`), where you can read the full description, view the status timeline, and add comments.

### 3.3 Switching Boards
- At the top of the left sidebar, there is a **Board Switcher** dropdown. Click it to quickly navigate between different boards you belong to without having to go back to the main dashboard.

---

## 4. User Profile & Notifications

### 4.1 Notifications (`/notifications`)
- **Description:** A feed of updates on requests you've created, commented on, or subscribed to.
- **Navigation:** Click on any notification to jump directly to the relevant request or comment.

### 4.2 User Profile (`/users/[username]`)
- **Description:** Your public profile showing your activity.
- **Navigation:** Accessible by clicking on user names within request comments or from the main menu.
