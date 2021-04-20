import { extendTheme, theme as defaultTheme } from "@chakra-ui/react"

export const theme = extendTheme({
  config: {
    initialColorMode: "dark",
  },

  fonts: {
    body: "Source Sans Pro, sans-serif",
    heading: "Source Sans Pro, sans-serif",
  },

  colors: {
    primary: {
      "50": "#EAFBF0",
      "100": "#C4F3D4",
      "200": "#9DEBB9",
      "300": "#77E49D",
      "400": "#51DC82",
      "500": "#2BD466",
      "600": "#22AA52",
      "700": "#1A7F3D",
      "800": "#115529",
      "900": "#092A14",
    },
    accent: {
      "50": "#F1E9FB",
      "100": "#D9C1F5",
      "200": "#C09AEF",
      "300": "#A772E8",
      "400": "#8E4BE2",
      "500": "#7623DC",
      "600": "#5E1CB0",
      "700": "#471584",
      "800": "#2F0E58",
      "900": "#18072C",
    },
  },

  styles: {
    global: (props: any) => ({
      body: {
        color: props.colorMode === "dark" ? "white" : "gray.600",
        bgRepeat: "no-repeat",
        bgAttachment: "fixed",
        bgGradient: `linear-gradient(
          171.56deg, 
          rgba(103, 73, 169, 0.97) 17.11%, 
          #241445 50.35%, 
          #1A002E 96.13%
        )`,
      },
    }),
  },

  components: {
    Button: {
      variants: {
        primary: {
          bg: "primary.600",
          borderRadius: "50px",
          boxShadow: "0px 3px 10px rgba(255, 255, 255, 0.25)",
        },

        secondary: {
          bg: "whiteAlpha.900",
          color: "accent.900",
          borderRadius: "50px",
        },
      },
    },

    Heading: {
      variants: {
        title: {
          fontWeight: "bold",
          fontSize: "4xl",
          textShadow: "0px 3px 10px rgba(255, 255, 255, 0.25)",
        },

        subTitle: {
          fontWeight: "500",
          fontSize: "xl",
          lineHeight: "150%",
          textShadow: "0px 3px 10px rgba(255, 255, 255, 0.25)",
        },
      },
    },
  },
})
