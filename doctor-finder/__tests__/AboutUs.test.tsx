import { render, screen } from "@testing-library/react";
import AboutUs from "@/app/aboutus/page";

test("renders AboutUs component", () => {
  render(<AboutUs />);
  expect(screen.getByText(/At Code 1, we created a website platform/i)).toBeInTheDocument();
});