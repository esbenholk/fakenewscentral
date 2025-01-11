'use client';

type ImageCardProps = {
    url: string;
    title: string;
    tags: string[];
  };
  
export const Card: React.FC<ImageCardProps> = ({ url, title, tags }) => {
    return (
        <div>
        <img src={url} alt={title}/>
        <div>
            <h1>{title}</h1>
            {/* <div>
                {tags && tags.map((tag, index) => (
                    <span
                    key={index}
                    className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                    >
                    {tag}
                    </span>
                ))}
            </div> */}
        </div>
    </div>
    );
  };
  
