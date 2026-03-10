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
  },
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