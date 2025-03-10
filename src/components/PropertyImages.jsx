import { Gallery, Item } from "react-photoswipe-gallery";
import "photoswipe/dist/photoswipe.css";

const PropertyImages = ({ images = [] }) => {
  if (!images || images.length === 0) {
    return <p className="text-center text-gray-500">No images available.</p>;
  }

  return (
    <Gallery>
      <section className="bg-blue-50 p-4">
        <div className="container mx-auto">
          {images.length === 1 ? (
            <Item
              original={
                images?.[0]?.includes("https://")
                  ? images[0]
                  : `/properties/${images[0]}`
              }
              thumbnail={
                images?.[0]?.includes("https://")
                  ? images[0]
                  : `/properties/${images[0]}`
              }
              width="1000"
              height="600"
            >
              {({ open }) => (
                <img
                  onClick={open} // Ensure click event works
                  src={
                    images?.[0]?.includes("https://")
                      ? images[0]
                      : `/properties/${images[0]}`
                  }
                  alt="Property"
                  className="object-cover h-[400px] w-full rounded-xl cursor-pointer"
                />
              )}
            </Item>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={
                    images.length === 3 && index === 2
                      ? "col-span-2"
                      : "col-span-1"
                  }
                >
                  <Item
                    original={
                      image.includes("https://")
                        ? image
                        : `/properties/${image}`
                    }
                    thumbnail={
                      image.includes("https://")
                        ? image
                        : `/properties/${image}`
                    }
                    width="1000"
                    height="600"
                  >
                    {({ open }) => (
                      <img
                        onClick={open}
                        src={
                          image.includes("https://")
                            ? image
                            : `/properties/${image}`
                        }
                        alt="Property"
                        className="object-cover h-[400px] w-full rounded-xl cursor-pointer"
                      />
                    )}
                  </Item>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Gallery>
  );
};

export default PropertyImages;
