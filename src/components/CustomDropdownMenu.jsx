import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const CustomDropdownMenu = ({ triggerButton, onAddToSemester }) => (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild>{triggerButton}</DropdownMenu.Trigger>
    <DropdownMenu.Portal>
      <DropdownMenu.Content>
        <DropdownMenu.Item onSelect={() => onAddToSemester('7')}>
          Add to Semester 7
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={() => onAddToSemester('9')}>
          Add to Semester 9
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
);

export default CustomDropdownMenu;
