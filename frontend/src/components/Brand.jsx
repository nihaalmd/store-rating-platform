import { Link } from "react-router-dom";

function Brand() {
  return (
    <Link to="/login" className="brand">
      <span className="brand-mark">S</span>
      <span>StoreRate</span>
    </Link>
  );
}

export default Brand;
