import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { ToastRegion, useToast } from "./Toast.js";

afterEach(() => vi.useRealTimers());
test("toast expires after five seconds and announces politely", () => {
  vi.useFakeTimers();
  render(<ToastRegion />);
  const { result } = renderHook(() => useToast());
  act(() => result.current.show({ title: "Saved" }));
  expect(screen.getByRole("status")).toHaveTextContent("Saved");
  act(() => vi.advanceTimersByTime(4999));
  expect(screen.getByText("Saved")).toBeVisible();
  act(() => vi.advanceTimersByTime(1));
  expect(screen.queryByText("Saved")).toBeNull();
});
test("action toast persists and can be closed", () => {
  vi.useFakeTimers();
  const action = vi.fn();
  render(<ToastRegion />);
  const { result } = renderHook(() => useToast());
  act(() =>
    result.current.show({
      title: "Removed",
      timeout: 1,
      action: { label: "Undo", onPress: action },
    }),
  );
  act(() => vi.advanceTimersByTime(60000));
  fireEvent.click(screen.getByRole("button", { name: "Undo" }));
  expect(action).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(screen.queryByText("Removed")).toBeNull();
});
test("only three toasts are visible", () => {
  render(<ToastRegion />);
  const { result } = renderHook(() => useToast());
  act(() => {
    for (let i = 0; i < 4; i++)
      result.current.show({
        title: `Saved ${i}`,
        action: { label: "Undo", onPress: () => {} },
      });
  });
  expect(screen.getAllByRole("status")).toHaveLength(3);
  expect(screen.queryByText("Saved 0")).toBeNull();
  fireEvent.click(
    screen.getAllByRole("button", { name: "Close" })[0] as HTMLElement,
  );
  expect(screen.getByText("Saved 0")).toBeVisible();
  expect(screen.getAllByRole("status")).toHaveLength(3);
});
test("hover pauses and resumes the remaining delay", () => {
  vi.useFakeTimers();
  render(<ToastRegion />);
  const { result } = renderHook(() => useToast());
  act(() => result.current.show({ title: "Paused" }));
  act(() => vi.advanceTimersByTime(2000));
  const region = screen.getByRole("region");
  fireEvent.pointerEnter(region, { pointerType: "mouse" });
  fireEvent.mouseEnter(region);
  act(() => vi.advanceTimersByTime(10000));
  expect(screen.getByText("Paused")).toBeVisible();
  fireEvent.pointerLeave(region, { pointerType: "mouse" });
  fireEvent.mouseLeave(region);
  act(() => vi.advanceTimersByTime(2999));
  expect(screen.getByText("Paused")).toBeVisible();
  act(() => vi.advanceTimersByTime(1));
  expect(screen.queryByText("Paused")).toBeNull();
});
test("focus pauses while close remains reachable", () => {
  vi.useFakeTimers();
  render(<ToastRegion />);
  const { result } = renderHook(() => useToast());
  act(() => result.current.show({ title: "Focused" }));
  act(() => screen.getByRole("button", { name: "Close" }).focus());
  act(() => vi.advanceTimersByTime(10000));
  expect(screen.getByText("Focused")).toBeVisible();
  act(() => screen.getByRole("button", { name: "Close" }).blur());
  act(() => vi.advanceTimersByTime(5000));
  expect(screen.queryByText("Focused")).toBeNull();
});
test("custom timeout is honored", () => {
  vi.useFakeTimers();
  render(<ToastRegion />);
  const { result } = renderHook(() => useToast());
  act(() => result.current.show({ title: "Brief", timeout: 1200 }));
  act(() => vi.advanceTimersByTime(1200));
  expect(screen.queryByText("Brief")).toBeNull();
});
