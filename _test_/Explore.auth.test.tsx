import { render, screen, waitFor } from "@testing-library/react-native";
import React from "react";
import ExploreScreen from "../app/(tabs)/explore";

jest.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({
          data: { user: null },
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
          data: [],
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

describe("Explore auth guard", () => {
  test("viser login melding når bruker ikke er logget inn", async () => {
    render(<ExploreScreen />);

    await waitFor(() => {
      expect(
        screen.getByText("Du må logge inn for å bruke appen.")
      ).toBeTruthy();
    });
  });
});