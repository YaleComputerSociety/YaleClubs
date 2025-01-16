const Footer = () => {
  return (
    <div className="w-full bg-transparent flex items-center my-5 px-4 sm:px-10 gap-2 flex-col justify-around">
      <div className="text-gray-400">Copyright Reserved © {new Date().getFullYear()} Yale Clubs</div>
      <div className="text-gray-400 text-xs lg:w-2/3">
        Yale is a registered trademark of Yale University. This website is student run and is maintained, hosted, and
        operated independently of Yale University. The activities on this website are not supervised or endorsed by Yale
        and information contained on this website does not necessarily reflect the opinions or official positions of the
        University
      </div>
    </div>
  );
};

export default Footer;
