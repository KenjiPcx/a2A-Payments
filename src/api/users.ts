import type { UserNode, UsersResponse } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const fetchUsers = async (): Promise<UserNode[]> => {
  try {
    const response = await fetch(`${API_URL}/api/chat/users`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: UsersResponse = await response.json();
    const users = data.users;
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

interface UpdateTeamStatusRequest {
  email: string;
  team_status: string;
}

export const updateTeamStatus = async (
  data: UpdateTeamStatusRequest
): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/api/chat/update-team-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error updating team status:", error);
    throw error;
  }
};
