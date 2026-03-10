import { render, screen, waitFor } from "@testing-library/react-native";
import React from "react";
import ExploreScreen from "../app/(tabs)/explore";

jest.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({
          data: { user: { id: "123" } },
          error: null,
        })
      ),
      onAuthStateChange: jest.fn(() => ({
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn(() =>
        Promise.resolve({
          data: [
            {
              id: 1,
              title: "Test",
              content: "Test content",
              user_id: "123",
              updated_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            },
          ],
          error: null,
        })
      ),
    })),
  },
}));

describe("Explore loader", () => {

  test("viser loader mens notater lastes", async () => {

    render(<ExploreScreen />);

    expect(screen.getByText("Laster...")).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText("Test")).toBeTruthy();
    });

  });

});