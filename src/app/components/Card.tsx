'use client';

type ImageCardProps = {
    url: string;
    title: string;
    tags: string[];
    date: string
  };
  
export const Card: React.FC<ImageCardProps> = ({ url, title, tags, date }) => {
    return (
        <>
            <div>
                <span className="Date">{date}</span>
                <img src={url} alt={title}/>
            </div>
            <div className="Info">
                <h1>{title}</h1>
                <div>
                    {tags && tags.map((tag, index) => (
                        <span
                        key={index}
                        className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                        >
                        {tag} 
                        {index !== tags.length -1 && "--"}
                        </span>
                    ))}
                </div>
            </div>
    </>
    );
  };
  
