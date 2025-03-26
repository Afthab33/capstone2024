import { render, screen, fireEvent } from "@testing-library/react";
import Help from "@/app/Help/page";

test("renders Help component", () => {
  render(<Help />);
  expect(screen.getByText(/Doctor Finder Help Desk/i)).toBeInTheDocument();
});
