import React, { useEffect } from 'react'

export default function FILENAME({ onClick }) {
  useEffect(() => console.log("rerendered")); // no need for React import
  return (
    <div className="COMPONENT_HASH">
      Some Text
      <MyButton {...{ onClick }}>My Call To Action</MyButton>
    </div>
  );
};

// I can define inline Components like normal
function MyButton({onClick}) {
  return <button className="Button" {...{onClick}}>{children}</button>
}