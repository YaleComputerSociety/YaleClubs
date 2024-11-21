type Props = {
  header: string;
  content: string | undefined;
  link?: string | undefined;
};

const ClubModalRightLabel = ({ header, content, link }: Props) => {
  if (!content) {
    return null;
  }

  return (
    <div className="flex flex-row justify-between gap-2 text-sm mt-4 font-semibold">
      <div className="text-gray-500">{header}</div>
      {link ? (
        <a className="text-blue-500" href={link}>
          {content}
        </a>
      ) : (
        <div className="text-gray-500">{content}</div>
      )}
    </div>
  );
};

export default ClubModalRightLabel;
