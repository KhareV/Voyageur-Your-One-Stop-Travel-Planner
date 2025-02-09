import { Gallery, Item } from "react-photoswipe-gallery";
import "photoswipe/dist/photoswipe.css"; // Import PhotoSwipe styles

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
              original={`/properties/${images[0]}`}
              thumbnail={`/properties/${images[0]}`}
              width="1000"
              height="600"
            >
              {({ open }) => (
                <img
                  onClick={open} // Ensure click event works
                  src={`/properties/${images[0]}`}
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
                    original={`/properties/${image}`}
                    thumbnail={`/properties/${image}`}
                    width="1000"
                    height="600"
                  >
                    {({ open }) => (
                      <img
                        onClick={open} // Fixed click event
                        src={`/properties/${image}`}
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
