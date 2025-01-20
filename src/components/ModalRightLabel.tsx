type Props = {
  header: string;
  content: string | undefined;
  link?: string | undefined;
  isSm?: boolean | undefined;
};

const ModalRightLabel = ({ header, content, link, isSm = false }: Props) => {
  if (!content) {
    return null;
  }

  return (
    <div className={`flex flex-row justify-between gap-6 text-sm font-semibold items-start ${!isSm ? "mt-4" : ""}`}>
      <div className="text-gray-500">{header}</div>
      {link ? (
        <a
          className={`text-right break-all min-w-0 ${content === "Report Event" ? "text-red-500" : "text-blue-500"}`}
          href={link}
        >
          {content}
        </a>
      ) : (
        <div className="text-gray-500 text-right break-all min-w-0">{content}</div>
      )}
    </div>
  );
};

export default ModalRightLabel;
