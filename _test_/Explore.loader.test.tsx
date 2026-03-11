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
              image_url: null,
            },
          ],
          error: null,
        })
      ),
    })),
  },
}));

jest.mock("../utils/notifications", () => ({
  ensureLocalNotificationPermissions: jest.fn(() => Promise.resolve()),
  localNotifyNewNote: jest.fn(() => Promise.resolve()),
}));

jest.mock("../utils/imagePicker", () => ({
  pickFromGallery: jest.fn(),
  requestImagePermissions: jest.fn(),
  takePhoto: jest.fn(),
}));

jest.mock("../utils/imageValidation", () => ({
  validateImageOrThrow: jest.fn(() => Promise.resolve()),
}));

jest.mock("../utils/uploadToSupabase", () => ({
  uploadImageAndGetPublicUrl: jest.fn(() =>
    Promise.resolve({ publicUrl: "https://example.com/test.jpg" })
  ),
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