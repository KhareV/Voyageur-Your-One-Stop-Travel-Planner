const PropertyHeaderImage = ({ image }) => {
  return (
    <section>
      <div className="container-xl m-auto">
        <div className="grid grid-cols-1">
          <img src={image} alt="" className="object-cover h-[400px] w-full" />
        </div>
      </div>
    </section>
  );
};
export default PropertyHeaderImage;
