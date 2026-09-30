// An action icon is either an emoji or a logo path under /public (e.g. '/4411.jpg').
export default function ActionIcon({ icon }: { icon: string }) {
  return icon.startsWith('/') ? <img className="icon-img" src={icon} alt="" /> : <>{icon}</>
}
