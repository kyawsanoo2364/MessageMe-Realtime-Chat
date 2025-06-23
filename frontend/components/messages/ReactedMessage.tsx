import React from "react";

interface ReactedMessageProps {
  onClick?: () => void;
  emoji: string;
  num: number;
  className?: string;
}

const ReactedMessage: React.FC<ReactedMessageProps> = ({
  onClick,
  emoji,
  num,
  className,
}) => {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer mt-2 flex items-center flex-row gap-1 px-1.5 w-fit p-1 rounded-full bg-black/10 ${className}`}
    >
      <span className="text-sm">{emoji}</span>
      {num > 1 && <span className="text-white text-sm pr-2">{num}</span>}
    </div>
  );
};

export default ReactedMessage;
