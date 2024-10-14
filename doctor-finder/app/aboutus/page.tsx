export default function AboutUs() {
    return (
        <div className="container max-w-full">
            {/* Blue background section */}
            <div className="hero-section" style={{ backgroundColor: '#cbe0f1', paddingBottom: '20px' }}>
                <div className="hero-content">
                    <h1 className="text-5xl pt-20 text-background text-center">About Us</h1>
                </div>
            </div>

            {/* Content outside blue background, this format is similar to React dealing with JSX but w/ tailwind in className*/}
            <div className="OurStory text-black text-5xl text-center" style={{ marginTop: '20px' }}>
                Our Story
            </div>
            <div className="AboutUsStory" style={{ marginTop: '20px' }}>
                <p>
                    At Code 1, we created a website platform to connect you to qualified doctors tailored to your specific needs. Our user-friendly
                    search engine allows you to easily compare doctors, read and give reviews, and explore their qualifications, ensuring you make informed choices
                    about your health. With a convenient map lookup, finding a healthcare professional nearby has never been any easier. We are here to support you
                    every step of the way. Your health matters to us, and we're committed to helping you find the best care possible. Because at Code1 we care.
                </p>
            </div>
            <div className="MeetOurTeam text-black text-5xl font-medium" style={{ marginTop: '40px' }}>
                Meet our team
            </div>
            <div className="OurNames" style={{display:"flex", alignItems: 'center', height: "26vh",}}>
                <div className="TrungDu w-[219px] text-[#829eb5] text-[24px] font-normal">Trung Du</div>
                <div className="MarcusEllison w-[219px] text-[#829eb5] text-[24px] font-normal">Marcus Ellison</div>
                <div className="DanielWagner w-[219px] text-[#829eb5] text-[24px] font-normal">Daniel Wagner</div>
                <div className="MarkOladipo w-[214px] text-[#829eb5] text-[24px] font-normal">Mark Oladipo</div>
                <div className="LaythGharbia w-[203px] text-[#829eb5] text-[24px] font-normal">Lalth Gharbia</div>
            </div>
        </div>
    )
}
