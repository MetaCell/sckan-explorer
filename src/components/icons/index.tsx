import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";
export const MinusIcon = () => (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.91663 13H17.0833" stroke="#4A4C4F" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
)

export const PlusIcon = () => (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13 8.91675V17.0834M8.91663 13.0001H17.0833" stroke="#4A4C4F" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
)

export const UncheckedItemIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 16 16" sx={{ width: 16, height: 16 }}>
    <rect x="0.5" y="0.5" width="15" height="15" rx="3.5" fill="white" />
    <rect
      x="0.5"
      y="0.5"
      width="15"
      height="15"
      rx="3.5"
      stroke="#B4BCCA"
      fill="none"
    />
  </SvgIcon>
);

export const CheckedItemIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 16 16" sx={{ width: 16, height: 16 }}>
    <rect x="0.5" y="0.5" width="15" height="15" rx="3.5" fill="#8300BF" />
    <path
      d="M12 5L6.5 10.5L4 8"
      stroke="#fff"
      strokeWidth="1.6666"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <rect
      x="0.5"
      y="0.5"
      width="15"
      height="15"
      rx="3.5"
      stroke="#8300BF"
      fill="none"
    />
  </SvgIcon>
);