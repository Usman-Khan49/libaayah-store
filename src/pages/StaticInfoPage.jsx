import { Footer } from "../components/layout";
import "../styles/pages/StaticInfoPage.css";

export default function StaticInfoPage({ title, description, points = [] }) {
  return (
    <div className="static-page">
      <div className="static-page-container">
        <h1 className="static-page-title">{title}</h1>
        <p className="static-page-description">{description}</p>
        {points.length > 0 && (
          <ul className="static-page-list">
            {points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        )}
      </div>
      <Footer />
    </div>
  );
}
