export default function LearningObjectives({items}: {items: readonly string[]}) {
  return (
    <div className="learning-objectives">
      <p className="objectives-label">By the end, you should be able to:</p>
      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>
  );
}
