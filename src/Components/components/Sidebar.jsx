import { Outlet } from "react-router-dom";
import AppNav from "./AppNav";
import Logo from "./Logo";
import styles from "./Sidebar.module.css";

function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <Logo />
      <AppNav />
      <Outlet />{" "}
      {/*Added to be able to display sub-routes [cities,countries,form] | BASICALLY LIKE CHILDREN PROP*/}
      <footer className={styles.footer}>
        <p className="styles.copyright">
          &copy; Copyright {new Date().getFullYear()} WorldWise Inc.
        </p>
      </footer>
    </div>
  );
}

export default Sidebar;
