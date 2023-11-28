import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const CustomDropdownMenu = ({ trigger, items }) => (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
    <DropdownMenu.Portal>
      <DropdownMenu.Content className="DropdownMenuContent">
        {items.map((item) => (
          <DropdownMenu.Item
            key={item.label}
            onSelect={item.action}
            className="DropdownMenuItem"
          >
            {item.label}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
);

export default CustomDropdownMenu;
