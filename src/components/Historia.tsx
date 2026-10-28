import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renderiza a história em Markdown. HTML cru é ignorado (react-markdown não
 * executa HTML por padrão), então o texto do dono não consegue injetar scripts.
 */
export function Historia({ markdown }: { markdown: string }) {
  return (
    <div className="historia">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h2>{children}</h2>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="nofollow ugc noopener noreferrer">
              {children}
            </a>
          ),
          // eslint-disable-next-line @next/next/no-img-element
          img: ({ src, alt }) => <img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} loading="lazy" referrerPolicy="no-referrer" />,
        }}
      >
        {markdown}
      </Markdown>
    </div>
  );
}
