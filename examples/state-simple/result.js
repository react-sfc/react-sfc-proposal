export default function FILENAME() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(count++)}>Click {count}</button>
      <style jsx>
        {`
          button {
            // scoped by default
            background-color: ${count > 5 ? "red" : "papayawhip"};
          }
        `}
      </style>
    </>
  );
};
