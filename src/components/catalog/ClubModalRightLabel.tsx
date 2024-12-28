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
    <div className="flex flex-row justify-between gap-6 text-sm mt-4 font-semibold items-start">
      <div className="text-gray-500">{header}</div>
      {link ? (
        <a className="text-blue-500 text-right break-all min-w-0" href={link}>
          {content}
        </a>
      ) : (
        <div className="text-gray-500 text-right break-all min-w-0">{content}</div>
      )}
    </div>
  );
};

export default ClubModalRightLabel;
