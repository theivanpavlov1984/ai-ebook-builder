import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBooks, ContinueCard } from "@/entities/book";
import { StartForm } from "./StartForm";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

beforeEach(() => {
  push.mockReset();
  useBooks.setState({ books: {}, history: {} });
});

describe("StartForm", () => {
  it("creates a book and opens the Describe step for a valid topic", async () => {
    render(<StartForm />);
    await userEvent.type(screen.getByLabelText(/what's your book about/i), "Morning routines for remote workers");
    await userEvent.click(screen.getByRole("button", { name: /start my book/i }));
    const [id] = Object.keys(useBooks.getState().books);
    expect(useBooks.getState().books[id].topic).toBe("Morning routines for remote workers");
    expect(push).toHaveBeenCalledWith(`/book/${id}/describe`);
  });

  it("explains an invalid topic, offers suggestions and does not navigate", async () => {
    render(<StartForm />);
    await userEvent.type(screen.getByLabelText(/what's your book about/i), "marketing");
    await userEvent.click(screen.getByRole("button", { name: /start my book/i }));
    expect(screen.getByText(/let's narrow it down/i)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Email marketing for solo founders" }));
    expect(screen.getByLabelText(/what's your book about/i)).toHaveValue("Email marketing for solo founders");
  });

  it("an empty start puts the cursor back in the field, which also tells the landing to stop its demo", async () => {
    const onFieldFocus = vi.fn();
    render(<StartForm placeholder="Morning routines" onFieldFocus={onFieldFocus} />);
    await userEvent.click(screen.getByRole("button", { name: /start my book/i }));
    const field = screen.getByLabelText(/what's your book about/i);
    expect(field).toHaveFocus();
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(onFieldFocus).toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("'Help me shape this idea' on an empty field asks for a rough idea first", async () => {
    render(<StartForm />);
    await userEvent.click(screen.getByRole("button", { name: /help me shape this idea/i }));
    expect(screen.getByText(/write a rough idea first/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/what's your book about/i)).toHaveFocus();
  });

  it("'Help me shape this idea' offers three topics", async () => {
    render(<StartForm />);
    await userEvent.type(screen.getByLabelText(/what's your book about/i), "pricing");
    await userEvent.click(screen.getByRole("button", { name: /help me shape this idea/i }));
    expect(screen.getAllByRole("button", { name: /pricing/i })).toHaveLength(3);
  });
});

describe("ContinueCard", () => {
  it("offers to continue the latest unfinished book", () => {
    const id = useBooks.getState().createBook("Morning routines for remote workers");
    useBooks.getState().updateBook(id, { stage: "outline" });
    render(<ContinueCard />);
    expect(screen.getByRole("link", { name: /continue/i })).toHaveAttribute("href", `/book/${id}/outline`);
  });

  it("renders nothing without an unfinished book", () => {
    const { container } = render(<ContinueCard />);
    expect(container).toBeEmptyDOMElement();
  });
});
