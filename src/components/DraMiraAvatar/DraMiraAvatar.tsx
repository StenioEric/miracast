import type { ReactElement } from "react";

import "./style.css";

type DraMiraAvatarProps = {
  className?: string;
};

export const DraMiraAvatar = ({
  className = "",
}: DraMiraAvatarProps): ReactElement => (
  <div
    className={`dra-mira-avatar ${className}`.trim()}
    aria-hidden="true"
  >
    👩‍🔬
  </div>
);