import React, { useEffect, useState } from "react";
import { PiClockFill } from "react-icons/pi";
import { useApp } from "@/context/AppContext";
import { useBatteryStatus } from "@/utils";
import { useLocationOptions, useLocationWeather } from "@/utils/enviroment";
import { getInfoMusicByUrl } from "@/services";
import { SonnerError, SonnerSuccess } from "@/components/ui/SonnerToast";
import FormMusicPoup from "@/components/PoupScreen/FormMusicPoup";
import FormReviewPoup from "@/components/PoupScreen/FormReviewPoup";

export default function GeneralThemes({ title }) {
  const { navigation, post } = useApp();
  const { setIsFilterOpen } = navigation;
  const { setPostOverlay } = post;
  const { addressOptions } = useLocationOptions();
  const { weather } = useLocationWeather();
  const { level, charging } = useBatteryStatus();

  const [time, setTime] = useState(() => new Date());
  const [savedAddressOptions, setSavedAddressOptions] = useState([]);

  const [loading, setLoading] = useState(false);

  // --- Popup States ---
  const [popupActive, setPopupActive] = useState(false); // hiệu ứng hiển thị
  const [formType, setFormType] = useState(""); // "spotify" | "apple"

  useEffect(() => {
    if (
      addressOptions.length > 0 &&
      JSON.stringify(addressOptions) !== JSON.stringify(savedAddressOptions)
    ) {
      setSavedAddressOptions(addressOptions);
    }
  }, [addressOptions, savedAddressOptions]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // === Overlay Apply ===
  const handleCustomeSelect = (data) => {
    setPostOverlay({
      overlay_id: data.preset_id || "standard",
      color_top: data.color_top || "",
      color_bottom: data.color_bottom || "",
      text_color: data.text_color || "#FFFFFF",
      icon: data.icon || "",
      caption: data.caption || "",
      type: data.type || "default",
      ...(data.music && { music: data.music }),
    });
    setIsFilterOpen(false);
  };

  // === MUSIC FORM ===
  const openMusicForm = (type) => {
    setFormType(type);
    requestAnimationFrame(() => setPopupActive(true));
  };

  const closeMusicForm = () => {
    setPopupActive(false);
    setTimeout(() => {
      setFormType("");
    }, 300);
  };

  const handleMusicSubmit = async (link) => {
    setLoading(true);
    try {
      const music = await getInfoMusicByUrl(
        link,
        formType === "apple" ? "apple" : "spotify",
      );

      handleCustomeSelect({
        preset_id: "music",
        caption: music.title,
        type: "music",
        music,
      });

      const musicType = formType === "apple" ? "Apple Music" : "Spotify";
      SonnerSuccess(`${musicType} by Dio`, "Lấy nhạc thành công");

      closeMusicForm();
    } catch {
      SonnerError("Không thể lấy thông tin bài hát");
    } finally {
      setLoading(false);
    }
  };

  const [reviewOpen, setReviewOpen] = useState(false);

  // === REVIEW FORM ===
  const openReviewForm = () => {
    setReviewOpen(true);
  };

  const closeReviewForm = () => {
    setReviewOpen(false);
  };

  const handleReviewSubmit = ({ rating, text }) => {
    handleCustomeSelect({
      preset_id: "review",
      icon: rating,
      caption: text,
      type: "review",
    });

    closeReviewForm();
  };

  // === MAIN BUTTON ACTIONS ===
  const handleClick = (id) => {
    switch (id) {
      case "default":
        handleCustomeSelect({ type: "default" });
        break;
      case "music":
        openMusicForm("spotify");
        break;
      case "music_apple":
        openMusicForm("apple");
        break;
      case "review":
        openReviewForm();
        break;
      case "time":
        handleCustomeSelect({
          preset_id: "time",
          caption: formattedTime,
          type: "time",
        });
        break;
      case "weather":
        handleCustomeSelect({
          preset_id: "weather",
          caption: weather || {},
          type: "weather",
        });
        break;
      case "battery":
        handleCustomeSelect({
          preset_id: "battery",
          caption: level || "50",
          icon: charging,
          type: "battery",
        });
        break;
      case "heart":
        handleCustomeSelect({
          preset_id: "heart",
          caption: "inlove",
          type: "heart",
        });
        break;
      default:
        break;
    }
  };

  const buttons = [
    {
      id: "default",
      icon: <span className="mr-1 font-semibold">Aa</span>,
      label: "Văn bản",
    },
    {
      id: "music",
      icon: <img src="./icons/music_icon.png" className="w-6 h-6 mr-1" />,
      label: "Spotify",
    },
    {
      id: "music_apple",
      icon: <img src="./svg/lcd-empty-logo.svg" className="w-5 h-5 mr-1" />,
      label: "Apple Music",
    },
    {
      id: "review",
      icon: <img src="./icons/star_icon.png" className="w-5 h-5 mr-1" />,
      label: "Review",
    },
    {
      id: "time",
      icon: <PiClockFill className="w-6 h-6 mr-1 rotate-270" />,
      label: formattedTime,
    },
    {
      id: "weather",
      icon: (
        <img
          src={
            weather?.icon
              ? `https:${weather.icon}`
              // : `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50"> <path d="M 24.984375 3.9863281 A 1.0001 1.0001 0 0 0 24 5 L 24 11 A 1.0001 1.0001 0 1 0 26 11 L 26 5 A 1.0001 1.0001 0 0 0 24.984375 3.9863281 z M 10.847656 9.8476562 A 1.0001 1.0001 0 0 0 10.150391 11.564453 L 14.394531 15.808594 A 1.0001 1.0001 0 1 0 15.808594 14.394531 L 11.564453 10.150391 A 1.0001 1.0001 0 0 0 10.847656 9.8476562 z M 39.123047 9.8476562 A 1.0001 1.0001 0 0 0 38.435547 10.150391 L 34.191406 14.394531 A 1.0001 1.0001 0 1 0 35.605469 15.808594 L 39.849609 11.564453 A 1.0001 1.0001 0 0 0 39.123047 9.8476562 z M 25 15 A 1.0001 1.0001 0 0 0 24.589844 15.083984 C 19.284905 15.312748 15 19.640816 15 25 C 15 30.505414 19.495611 35 25 35 C 30.50528 35 35 30.50528 35 25 C 35 19.642276 30.717945 15.314763 25.414062 15.083984 A 1.0001 1.0001 0 0 0 25 15 z M 25 17 C 29.420586 17 33 20.580389 33 25 C 33 29.42072 29.42072 33 25 33 C 20.580389 33 17 29.420586 17 25 C 17 20.580523 20.580523 17 25 17 z M 5 24 A 1.0001 1.0001 0 1 0 5 26 L 11 26 A 1.0001 1.0001 0 1 0 11 24 L 5 24 z M 39 24 A 1.0001 1.0001 0 1 0 39 26 L 45 26 A 1.0001 1.0001 0 1 0 45 24 L 39 24 z M 15.082031 33.890625 A 1.0001 1.0001 0 0 0 14.394531 34.193359 L 10.150391 38.435547 A 1.0001 1.0001 0 1 0 11.564453 39.849609 L 15.808594 35.607422 A 1.0001 1.0001 0 0 0 15.082031 33.890625 z M 34.888672 33.890625 A 1.0001 1.0001 0 0 0 34.191406 35.607422 L 38.435547 39.849609 A 1.0001 1.0001 0 1 0 39.849609 38.435547 L 35.605469 34.193359 A 1.0001 1.0001 0 0 0 34.888672 33.890625 z M 24.984375 37.986328 A 1.0001 1.0001 0 0 0 24 39 L 24 45 A 1.0001 1.0001 0 1 0 26 45 L 26 39 A 1.0001 1.0001 0 0 0 24.984375 37.986328 z"></path> </svg>`
            : "./icons/sun_max_indicator.png"
            // : "data:image/svg+xml,%3c?xml%20version=%271.0%27%20encoding=%27UTF-8%27?%3e%3c!--Generator:%20Apple%20Native%20CoreSVG%20232.5--%3e%3c!DOCTYPE%20svg%20PUBLIC%20%27-//W3C//DTD%20SVG%201.1//EN%27%20%27http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd%27%3e%3csvg%20version=%271.1%27%20xmlns=%27http://www.w3.org/2000/svg%27%20xmlns:xlink=%27http://www.w3.org/1999/xlink%27%20width=%27271.191%27%20height=%27271.973%27%3e%3cg%3e%3crect%20height=%27271.973%27%20opacity=%270%27%20width=%27271.191%27%20x=%270%27%20y=%270%27/%3e%3cpath%20d=%27M135.547%2046.9727C140.723%2046.9727%20144.824%2042.7734%20144.824%2037.6953L144.824%209.27734C144.824%204.19922%20140.723%200%20135.547%200C130.469%200%20126.367%204.19922%20126.367%209.27734L126.367%2037.6953C126.367%2042.7734%20130.469%2046.9727%20135.547%2046.9727ZM198.34%2073.1445C201.953%2076.6602%20207.812%2076.7578%20211.523%2073.1445L231.641%2053.0273C235.156%2049.4141%20235.156%2043.457%20231.641%2039.8438C228.027%2036.3281%20222.168%2036.3281%20218.555%2039.8438L198.34%2060.0586C194.824%2063.6719%20194.824%2069.5312%20198.34%2073.1445ZM224.316%20135.938C224.316%20141.016%20228.516%20145.117%20233.594%20145.117L261.914%20145.117C266.992%20145.117%20271.191%20141.016%20271.191%20135.938C271.191%20130.859%20266.992%20126.66%20261.914%20126.66L233.594%20126.66C228.516%20126.66%20224.316%20130.859%20224.316%20135.938ZM198.34%20198.73C194.824%20202.344%20194.824%20208.203%20198.34%20211.816L218.555%20232.031C222.168%20235.547%20228.027%20235.449%20231.641%20231.934C235.156%20228.32%20235.156%20222.559%20231.641%20218.945L211.426%20198.73C207.812%20195.215%20201.953%20195.215%20198.34%20198.73ZM135.547%20224.902C130.469%20224.902%20126.367%20229.004%20126.367%20234.082L126.367%20262.5C126.367%20267.676%20130.469%20271.777%20135.547%20271.777C140.723%20271.777%20144.824%20267.676%20144.824%20262.5L144.824%20234.082C144.824%20229.004%20140.723%20224.902%20135.547%20224.902ZM72.8516%20198.73C69.2383%20195.215%2063.2812%20195.215%2059.668%20198.73L39.5508%20218.848C36.0352%20222.461%2036.0352%20228.223%2039.4531%20231.836C43.0664%20235.352%2048.9258%20235.449%2052.5391%20231.934L72.7539%20211.816C76.2695%20208.203%2076.2695%20202.344%2072.8516%20198.73ZM46.7773%20135.938C46.7773%20130.859%2042.6758%20126.66%2037.5977%20126.66L9.27734%20126.66C4.19922%20126.66%200%20130.859%200%20135.938C0%20141.016%204.19922%20145.117%209.27734%20145.117L37.5977%20145.117C42.6758%20145.117%2046.7773%20141.016%2046.7773%20135.938ZM72.7539%2073.1445C76.2695%2069.6289%2076.2695%2063.5742%2072.8516%2060.0586L52.6367%2039.8438C49.1211%2036.4258%2043.2617%2036.3281%2039.6484%2039.8438C36.1328%2043.457%2036.1328%2049.4141%2039.5508%2052.9297L59.668%2073.1445C63.2812%2076.6602%2069.1406%2076.6602%2072.7539%2073.1445Z%27%20fill=%27%23FFC107%27/%3e%3cpath%20d=%27M135.449%20198.828C169.824%20198.828%20198.34%20170.312%20198.34%20135.938C198.34%20101.465%20169.824%2072.9492%20135.449%2072.9492C101.074%2072.9492%2072.6562%20101.465%2072.6562%20135.938C72.6562%20170.312%20101.074%20198.828%20135.449%20198.828Z%27%20fill=%27%23FFC107%27/%3e%3c/g%3e%3c/svg%3e"
          }
          alt="Weather"
          className="w-6 h-6 mr-1"
          // style={{ background: linear-gradient(rgb(45, 154, 255), rgb(107, 220, 255)), color: rgba(255, 255, 255, 0.9),}}
        />
      ),
      label:
        weather?.temp_c_rounded !== undefined
          ? `${weather.temp_c_rounded}°C`
          : "Thời tiết",
    },
    {
      id: "battery",
      icon: (
        <img
          src="https://img.icons8.com/?size=100&id=WDlpopZDVw4P&format=png&color=000000"
          className="w-6 h-6 mr-1"
        />
      ),
      label: `${level || "50"}%`,
    },
    {
      id: "location",
      icon: (
        <img
          src="https://img.icons8.com/?size=100&id=NEiCAz3KRY7l&format=png&color=000000"
          className="w-6 h-6 mr-1"
        />
      ),
      label: savedAddressOptions[0] || "Vị trí",
    },
  ];

  return (
    <>
      <div className="px-4">
        {title && (
          <div className="flex flex-row gap-3 items-center mb-2">
            <h2 className="text-md font-semibold text-primary">{title}</h2>
            <div className="badge badge-sm badge-secondary">New</div>
          </div>
        )}

        {/* --- BUTTON GRID --- */}
        <div className="flex flex-wrap gap-4 pt-2 pb-5 justify-start">
          {buttons.map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => handleClick(id)}
              /* className="flex flex-col whitespace-nowrap bg-base-200 dark:bg-white/30
              backdrop-blur-3xl items-center space-y-1 py-2 px-4 btn h-auto w-auto
              rounded-3xl font-semibold justify-center"  > */
            classname="relative flex flex-col whitespace-nowrap backdrop-blur-3xl items-center space-y-1 py-2 px-4 btn h-auto w-auto rounded-3xl font-semibold justify-center"
             style="background: linear-gradient(rgb(45, 154, 255), rgb(107, 220, 255)); color: rgb(255, 255, 255);"
             >
             <span className="text-base flex flex-row items-center gap-1">
                {icon}
                {id === "location" ? (
                  <div className="relative w-max">
                    <div className="cursor-pointer select-none">
                      {savedAddressOptions[0] || "Vị trí"}
                    </div>
                    <select
                      className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) =>
                        handleCustomeSelect({
                          preset_id: "location",
                          caption: e.target.value,
                          type: "location",
                        })
                      }
                    >
                      <option value="" disabled>
                        Chọn địa chỉ...
                      </option>
                      {savedAddressOptions.map((opt, idx) => (
                        <option key={idx} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  label
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
      {/* === POPUP MUSIC FORM === */}
      <FormMusicPoup
        open={popupActive}
        onClose={closeMusicForm}
        onConfirm={handleMusicSubmit}
        loading={loading}
        formType={formType}
        icon={
          formType === "apple" ? (
            <img src="./svg/lcd-empty-logo.svg" className="w-8 h-8" />
          ) : (
            <img src="./icons/spotify_icon.png" className="w-8 h-8" />
          )
        }
        title={`Nhập link ${formType === "apple" ? "Apple Music" : "Spotify"}`}
      />

      {/* === POPUP REVIEW FORM === */}
      <FormReviewPoup
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onConfirm={handleReviewSubmit}
        title={"Caption Review"}
      />
    </>
  );
}
