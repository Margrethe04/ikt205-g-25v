import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import React from "react";
import HomeScreen from "../app/(tabs)/index";
import { supabase } from "../lib/supabase";

jest.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(() =>
        Promise.resolve({ data: { session: null } })
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

describe("HomeScreen auth", () => {

  test("viser login skjerm når bruker ikke er logget inn", async () => {

    render(<HomeScreen />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("E-post")).toBeTruthy();
      expect(screen.getByPlaceholderText("Passord")).toBeTruthy();
    });

  });

  test("kan logge inn", async () => {

    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: {},
      error: null,
    });

    render(<HomeScreen />);

    fireEvent.changeText(screen.getByPlaceholderText("E-post"), "test@test.no");
    fireEvent.changeText(screen.getByPlaceholderText("Passord"), "123456");

    fireEvent.press(screen.getByText("Logg inn"));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
    });

  });

  test("kan opprette bruker", async () => {

    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: {},
      error: null,
    });

    render(<HomeScreen />);

    fireEvent.changeText(screen.getByPlaceholderText("E-post"), "test@test.no");
    fireEvent.changeText(screen.getByPlaceholderText("Passord"), "123456");

    fireEvent.press(screen.getByText("Opprett konto"));

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalled();
    });

  });

  test("kan logge ut når bruker er logget inn", async () => {

    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: "123" } } },
    });

    render(<HomeScreen />);

    await waitFor(() => {
      expect(screen.getByText("Logg ut")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Logg ut"));

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

  });

});