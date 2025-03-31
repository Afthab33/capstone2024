export default function AboutUs() {
    return (
        <div className="container max-w-full">
            <div className="mx-4 sm:mx-8 md:mx-16 lg:mx-20 pb-20">
                <h1 className="lg:text-5xl text-4xl pt-10 lg:pt-20 text-foreground sm:text-left md:text-center lg:text-center font-semibold">About Us</h1>
                <p className="text-foreground text-lg sm:text-lg md:text-xl lg:text-xl pt-10 lg:mx-20 xl:mx-60 sm:text-left md:text-center lg:text-center">
                At Code 1, we created a website platform to connect you to qualified doctors tailored to your specific needs. Our user-friendly search engine allows you to easily compare doctors, read and give reviews, and explore their qualifications, ensuring you make informed choices about your health. With a convenient map lookup, finding a healthcare professional nearby has never been any easier. We are here to support you every step of the way. Your health matters to us, and we're committed to helping you find the best care possible. Because at Code1 we care.
                </p>
            </div>
            <div className="bg-secondary text-secondary-foreground">
                <div className="mx-4 sm:mx-8 md:mx-16 lg:mx-20 pb-20">
                    <h1 className="text-4xl pt-10 text-left text-white dark:text-black lg:mx-20 xl:mx-60 font-semibold">Our Team</h1>
                    <div className=" text-white dark:text-black pt-10 text-md sm:text-lg md:text-lg lg:text-xl lg:mx-20 xl:mx-60 flex justify-between">
                        <p>Trung Du</p>
                        <p>Marcus Ellison</p>
                        <p>Daniel Wagner</p>
                        <p>Mark Oladipo</p>
                        <p>Layth Gharbia</p>
                    </div>
                </div>
            </div>
        </div>
    )
}