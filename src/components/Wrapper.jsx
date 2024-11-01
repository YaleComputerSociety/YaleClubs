
const Wrapper = ({ children }) => {    
    return (
        <div className="py-10 ph:mt-14 md:mt-20 w-full flex items-center">
            <div className="w-full lg:w-[920px]">
                {children}
            </div>
        </div>
    );
};

export default Wrapper;
