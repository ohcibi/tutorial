/**
 * @jest-environment jsdom-sixteen
 */

import { visit } from "../lib/test-helpers";
import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import makeServer from "../server";

let server;

beforeEach(() => {
  server = makeServer("test");
})

afterEach(() => {
  server.shutdown();
})

test("it should not include reminders from other lists", async () => {
  const listOne = server.create("list", { name: "List One" });
  const listTwo = server.create("list", { name: "List Two" });

  server.create("reminder", {
    list: listOne,
    text: "Reminder One"
  });

  server.create("reminder", {
    list: listTwo,
    otherFk: listOne,
    text: "Reminder Two"
  });

  visit("/1");
  await waitForElementToBeRemoved(() => screen.getByText("Loading..."));

  expect(screen.getByText("Reminder One")).toBeInTheDocument();
  expect(screen.queryByText("Reminder Two")).not.toBeInTheDocument();
});
