/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import mockStore from "../__mocks__/store";

describe("Given I am connected as an employee", () => {
    $.fn.modal = jest.fn();

    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
        "user",
        JSON.stringify({
            type: "Employee",
            email: "a@a",
        })
    );
    describe("When I am on Bills Page", () => {
        test("Then bill icon in vertical layout should be highlighted", async () => {
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Bills);
            await waitFor(() => screen.getByTestId("icon-window"));
            const windowIcon = screen.getByTestId("icon-window");
            expect(windowIcon.getAttribute("class")).toMatch("active-icon");
        });
        test("Then bills should be ordered from earliest to latest", () => {
            document.body.innerHTML = BillsUI({ data: bills });
            const dates = screen
                .getAllByText(
                    /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
                )
                .map((a) => a.innerHTML);
            const antiChrono = (a, b) => (a < b ? 1 : -1);
            const datesSorted = [...dates].sort(antiChrono);
            expect(dates).toEqual(datesSorted);
        });
    });

    //NEW BILL BTN
    describe("When I am on Bills Page and I click on the new bill button", () => {
        test("then should navigate to the page to create new bill", () => {
            document.body.innerHTML = BillsUI({ data: bills });

            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };
            const billsContainer = new Bills({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorage,
            });
            const newBill = screen.getByTestId("btn-new-bill");
            const handleNavigateToNewBillPage = jest.fn(() => {
                billsContainer.handleClickNewBill;
            });
            newBill.addEventListener("click", handleNavigateToNewBillPage);
            fireEvent.click(newBill);
            expect(
                screen.getAllByText("Envoyer une note de frais")
            ).toBeTruthy();
        });
    });

    //BLUE EYE ICON
    describe("When I am on Bills Page and I click the eye icon", () => {
        test("Then the modal with the note image should display", async () => {
            $.fn.modal = jest.fn();

            document.body.innerHTML = BillsUI({ data: bills });

            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };
            const billsContainer = new Bills({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorage,
            });
            const iconEye = screen.getAllByTestId("icon-eye")[0];
            const handleShowModalFile = jest.fn((e) => {
                billsContainer.handleClickIconEye(e.target);
            });
            iconEye.addEventListener("click", handleShowModalFile);
            fireEvent.click(iconEye);
            expect(screen.getAllByText("Justificatif")).toBeTruthy();
        });
    });

    //GET BILLS
    describe("Get data", () => {
        test("Then get data", async () => {
            localStorage.setItem(
                "user",
                JSON.stringify({ type: "Employee", email: "a@a" })
            );
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();

            window.onNavigate(ROUTES_PATH.Bills);
            await waitFor(() => screen.getByText("Mes notes de frais"));
            expect(screen.getByText("Mes notes de frais")).toBeTruthy();
        });

        describe("When I get bills", () => {
            test("Then it should render bills", async () => {
                const bills = new Bills({
                    document,
                    onNavigate,
                    store: mockStore,
                    localStorage: window.localStorage,
                });
                const getBills = jest.fn(() => bills.getBills());
                const value = await getBills();
                expect(getBills).toHaveBeenCalled();
                expect(value.length).toBe(4);
            });
        });
    });
});
