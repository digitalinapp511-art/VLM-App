import image from '../../assets/logo.png'
export function VlmLogo() {
  return (
    <div className="flex flex-col items-center gap-2 select-none">
      {/* We render the logo as a styled text+SVG composite since the
          actual asset isn't available. Replace <img src="..."> when
          the real logo asset is provided in /src/assets/. */}
      <img src={image} alt="VLM Academy" className=" md:max-w-sm w-auto" />
    </div>
  );
}