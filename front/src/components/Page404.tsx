import Footer from "../components/Footer";
import Logo from "../components/Logo";

export default function Page404() {
  return (
    <div className="super-wrapper">
      <section className="wrapper">
        <Logo/>

        <h1>There's nothing here</h1>

        <img
          src="https://media.giphy.com/media/3o7aCTPPm4OHfRLSH6/giphy.gif"
          width="480"
          height="360"
        />
        <a className="btn">back</a>
      </section>
      <Footer/>
    </div>
  );
}
