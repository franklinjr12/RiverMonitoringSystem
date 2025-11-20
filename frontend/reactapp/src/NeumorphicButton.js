import React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";

const NeumorphicButtonRoot = styled(Button)(({ theme }) => ({
  borderRadius: "20px",
  background: "#e0e0e0",
  color: "#555",
  padding: "12px 24px",
  textTransform: "none",
  boxShadow: `
    6px 6px 12px #bebebe,
    -6px -6px 12px #ffffff
  `,
  transition: "0.25s ease",

  "&:hover": {
    background: "#e0e0e0",
    boxShadow: `
      2px 2px 6px #bebebe,
      -2px -2px 6px #ffffff,
      0 0 10px rgba(150, 150, 255, 0.25)
    `,
  },

  "&.Mui-focusVisible": {
    boxShadow: `
      0 0 15px rgba(150, 150, 255, 0.6),
      6px 6px 12px #bebebe,
      -6px -6px 12px #ffffff
    `,
  },

  "&:active": {
    boxShadow: `
      inset 4px 4px 8px #bebebe,
      inset -4px -4px 8px #ffffff
    `,
  },

  "&.Mui-disabled": {
    background: "#d6d6d6",
    color: "#aaa",
    boxShadow: "none",
  },
}));

export default function NeumorphicButton(props) {
  return <NeumorphicButtonRoot {...props} />;
}
