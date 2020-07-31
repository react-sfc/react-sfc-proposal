export const STYLE = `
div {
  // scoped by default
  background-color: papayawhip;
  .Button {
    border-color: cadetblue;
  }
}
`;

export default ({ onClick }) => {
  useEffect(() => console.log("rerendered")); // no need for React import
  return (
    <div>
      Some Text
      <MyButton {...{ onClick }}>My Call To Action</MyButton>
    </div>
  );
};

// I can define inline Components like normal
function MyButton({onClick}) {
  return <button className="Button" {...{onClick}}>{children}</button>
}