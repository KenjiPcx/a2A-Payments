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
