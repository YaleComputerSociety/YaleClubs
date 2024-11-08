const Footer = () => {
  return (
    <div
      className="
            w-full 
            absolute 
            bottom-0 
            bg-transparent
            p-5 flex
            items-center
            justify-center
        "
    >
      <div className="text-gray-300">Copyright Reserved © {new Date().getFullYear()} Yale Clubs</div>
    </div>
  );
};

export default Footer;
