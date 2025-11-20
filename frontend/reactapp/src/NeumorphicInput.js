import React from "react";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";

const NeumorphicInputRoot = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    borderRadius: "20px",
    background: "#e0e0e0",
    color: "#555",
    padding: "8px 16px",
    boxShadow: `
      6px 6px 12px #bebebe,
      -6px -6px 12px #ffffff
    `,
    transition: "0.25s ease",
  },
  '& .MuiInputBase-root:hover': {
    background: "#e0e0e0",
    boxShadow: `
      2px 2px 6px #bebebe,
      -2px -2px 6px #ffffff,
      0 0 10px rgba(150, 150, 255, 0.25)
    `,
  },
  '& .MuiInputBase-root.Mui-focused': {
    boxShadow: `
      0 0 15px rgba(150, 150, 255, 0.6),
      6px 6px 12px #bebebe,
      -6px -6px 12px #ffffff
    `,
  },
  '& .MuiInputBase-root.Mui-disabled': {
    background: "#d6d6d6",
    color: "#aaa",
    boxShadow: "none",
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
}));

export default function NeumorphicInput(props) {
  return <NeumorphicInputRoot variant="outlined" fullWidth {...props} />;
}
