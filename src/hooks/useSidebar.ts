import { atom, useRecoilState } from "recoil";

const sidebarState = atom({
  key: "sidebarState",
  default: false,
});

export function useSidebar() {
  const [isOpen, setIsOpen] = useRecoilState(sidebarState);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  return { isOpen, setIsOpen, toggle };
}
