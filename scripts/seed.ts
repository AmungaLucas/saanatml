import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function seed() {
  // === CATEGORIES ===
  const categories = await Promise.all([
    db.category.create({
      data: { name: 'Opinion & Commentary', slug: 'opinion-commentary', description: 'Strong takes on culture, policy, identity, and the creative economy in East Africa.', color: '#8B2252' }
    }),
    db.category.create({
      data: { name: 'Music', slug: 'music', description: 'Kenyan and East African music scene — from gengetone to benga, Afro-fusion and beyond.', color: '#C75B39' }
    }),
    db.category.create({
      data: { name: 'Film & Video', slug: 'film-video', description: 'Reviews, commentary and features on East African cinema, documentaries and digital content.', color: '#2D5A3D' }
    }),
    db.category.create({
      data: { name: 'Books & Literature', slug: 'books-literature', description: 'Book reviews, literary criticism and conversations around East African writing.', color: '#4A6B8A' }
    }),
    db.category.create({
      data: { name: 'Visual Arts', slug: 'visual-arts', description: 'Gallery reviews, artist profiles and commentary on contemporary African visual art.', color: '#9B6B3E' }
    }),
    db.category.create({
      data: { name: 'Theatre & Performance', slug: 'theatre-performance', description: 'Stage reviews, theatre features and performance criticism from East Africa.', color: '#6B4C8A' }
    }),
    db.category.create({
      data: { name: 'Interviews & Features', slug: 'interviews-features', description: 'In-depth conversations with artists, musicians, writers and cultural figures shaping East Africa.', color: '#3A7B6B' }
    }),
    db.category.create({
      data: { name: 'Creative Economy', slug: 'creative-economy', description: 'Industry trends, grants, funding opportunities, and the business of creativity in Kenya and East Africa.', color: '#B8860B' }
    }),
  ])

  const [opinion, music, film, books, visual, theatre, interviews, creative] = categories

  // === AUTHORS ===
  const authors = await Promise.all([
    db.author.create({
      data: { name: 'Admin Sanaa', slug: 'admin-sanaa', bio: 'Founder and editor of Sanaa Through My Lens. Passionate about amplifying East African voices in arts and culture. Based in Nairobi.', avatar: '', role: 'Founder & Editor' }
    }),
    db.author.create({
      data: { name: 'Wanjiku Editor', slug: 'wanjiku-editor', bio: 'Senior editor and cultural critic with a focus on literature, visual arts and cultural policy. Wanjiku brings sharp analysis and deep knowledge of the East African creative landscape.', avatar: '', role: 'Senior Editor & Cultural Critic' }
    }),
    db.author.create({
      data: { name: 'Otieno Writer', slug: 'otieno-writer', bio: 'Writer and researcher covering theatre, music history and cultural heritage across East Africa. With a background in performance studies, Otieno brings academic rigour to accessible storytelling.', avatar: '', role: 'Staff Writer & Researcher' }
    }),
    db.author.create({
      data: { name: 'Sharon Agigi', slug: 'sharon-agigi', bio: 'Music journalist and event reviewer with her finger on the pulse of Nairobi\'s live music scene. Sharon covers everything from jazz to gengetone with equal passion.', avatar: '', role: 'Music Journalist' }
    }),
  ])

  const [admin, wanjiku, otieno, sharon] = authors

  // === ARTICLES ===
  await db.article.createMany({
    data: [
      {
        title: "Kenya's Creative Economy — in a nutshell",
        slug: "kenyas-creative-economy-in-a-nutshell",
        excerpt: "For generations, the Kenyan dream followed a familiar script: excel in school, secure a stable job, and build a life. Creativity was a hobby, not a career. But today, young Kenyans are tearing up that script.",
        content: `## The Old Script\n\nFor a long time, the Kenyan dream followed a familiar script: go to school, get good grades, graduate, secure a stable 8-5 job, or not, and build a life from there. Creativity was a side note. Something you pursue after work, on weekends, or not at all.\n\nYoung people today, however, are rewriting this narrative.\n\nAcross the country, more young Kenyans are turning their hobbies into income streams. Content creators, writers, musicians, actors, podcasters, gamers, designers, name them. It is now common to meet a member of a music band who went to law school, or a university graduate making a living from YouTube, TikTok, or beat production.\n\n## The Crisis That Sparked It\n\nKenya's unemployment crisis is well-documented. Every year, universities and colleges release thousands of graduates into an economy that simply can no longer absorb them into formal employment. Millions of young graduates are either unemployed or underemployed, surviving on short-term contracts, informal work, or family support.\n\nAccording to statistics, **60-70% of Kenya's population is made up of young people**. This demographic reality is often framed as a looming crisis, but it is also the country's greatest asset.\n\n## Monetising Joy\n\n> "Do something you love and you will never work a day in your life" may sound clich\u00e9, but Gen Z took it seriously.\n\nThe rise of digital platforms has made this possible. YouTube, TikTok, Spotify, Substack, Instagram and podcasting platforms have opened up global markets for Kenyan creativity.\n\nWhat's different now is that creativity is no longer just about self-expression. It is increasingly about income. Kenyans are learning how to package, brand, distribute, and monetise their ideas.\n\n## The Opportunity in the Crisis\n\nUnemployment may be Kenya's biggest problem but it is also the biggest opportunity. A job-scarce economy has pushed young people to innovate, to freelance, to build audiences, and to think entrepreneurially.\n\nThe creative economy will not replace traditional employment entirely, but it can absorb talent, generate income, export culture, and tell Kenyan stories to the world.\n\nWhat is needed now is deliberate support: better policy, fair digital monetisation, access to funding, and recognition of creativity as an industry.\n\n*I am not making music as I look for a job; this is the job and it should pay.*`,
        coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=500&fit=crop",
        categoryId: opinion.id,
        authorId: admin.id,
        publishedAt: new Date('2026-06-17'),
        readTime: 4,
        tags: "Kenya,Trending,#KenyanCreativeEconomy",
        isFeatured: true,
        isPinned: true,
      },
      {
        title: "Getting into The BAG!",
        slug: "getting-into-the-bag",
        excerpt: "The BAG has been one of the most entertaining things the 2025 Kenyan music scene gave us. From DJs showcasing their prowess to the frontline energy, themes, and cultural moments.",
        content: `## What is The BAG?\n\nThe BAG has been one of the most entertaining things the 2025 Kenyan music scene gave us. From DJs showcasing their prowess to the frontline energy, themes, and cultural moments, this is more than just a DJ-mix event.\n\nIt's a cultural phenomenon. A weekly gathering that has become a ritual for Nairobi's young music lovers, blending the energy of a club night with the intimacy of a listening session.\n\n## The Energy\n\nWhat sets The BAG apart is the intentionality. Every edition has a theme, sometimes it's a tribute to a specific artist or genre, other times it's a mood or a cultural moment. The DJs don't just play music; they curate experiences.\n\nThe frontline energy is unmatched. You'll find people who know every lyric, who've been following Kenyan music since the benga days, standing shoulder to shoulder with teenagers discovering gengetone for the first time.\n\n## More Than a DJ Event\n\nThe BAG has become a launchpad for new talent. Unknown producers get their tracks played alongside established hits. Visual artists create live projections. Fashion designers use the crowd as their runway.\n\nIt's proof that Nairobi doesn't need imported culture; we have enough of our own to fill arenas, if only we invest in it.\n\n## What's Next\n\nThe question on everyone's mind is whether The BAG can scale without losing its soul. Can it become bigger, move to larger venues, attract sponsors, and still feel like the intimate, culture-first gathering that made it special?\n\nIf the team behind it stays true to their vision, the answer is yes. The BAG isn't just an event; it's a blueprint for what Kenyan nightlife could be.`,
        coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=500&fit=crop",
        categoryId: music.id,
        authorId: sharon.id,
        publishedAt: new Date('2026-05-23'),
        readTime: 5,
        tags: "Music,Nairobi,Events,DJ Culture",
        isFeatured: true,
        isPinned: true,
      },
      {
        title: "Lamu Cultural Festival: Preserving Swahili Heritage",
        slug: "lamu-cultural-festival-preserving-swahili-heritage",
        excerpt: "Celebrating twenty years of the Lamu Cultural Festival and its role in preserving Swahili traditions.",
        content: `## Twenty Years of Culture\n\nCelebrating twenty years of the Lamu Cultural Festival and its role in preserving Swahili traditions. This isn't just a festival; it's a living archive of coastal Kenyan culture.\n\nThe Lamu Cultural Festival has grown from a small gathering of local artisans and musicians into one of East Africa's most important cultural events. But its core mission remains the same: to celebrate, preserve, and pass on Swahili heritage.\n\n## What Makes Lamu Special\n\nLamu Old Town is a UNESCO World Heritage Site, and walking its narrow streets feels like stepping back in time. The festival takes full advantage of this setting, with events spread across historic venues, from the Lamu Fort to traditional stone houses.\n\n## The Programme\n\nThe festival features dhow races, donkey races, poetry readings, traditional Swahili music performances, and art exhibitions. But the real magic is in the smaller moments: impromptu jam sessions in alleyways, elders sharing stories with younger generations, and the sheer joy of a community celebrating its identity.\n\n## Why It Matters\n\nIn a world where globalisation threatens to homogenise culture, the Lamu Cultural Festival is a powerful reminder that heritage isn't something to be preserved in museums; it's something to be lived, breathed, and shared.\n\nThe festival also provides economic opportunities for local artisans, musicians, and hospitality workers, proving that cultural preservation and economic development can go hand in hand.`,
        coverImage: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&h=500&fit=crop",
        categoryId: creative.id,
        authorId: otieno.id,
        publishedAt: new Date('2026-05-18'),
        readTime: 5,
        tags: "Events,Heritage,Swahili Culture,Lamu",
        isFeatured: true,
        isPinned: true,
      },
      {
        title: "Afrofuturism in East African Visual Art: Beyond Wakanda",
        slug: "afrofuturism-in-east-african-visual-art-beyond-wakanda",
        excerpt: "How East African artists are creating Afrofuturist visions that go beyond Hollywood stereotypes and imagine truly African futures.",
        content: `## Beyond Hollywood\n\nWhen most people hear "Afrofuturism," they think of Black Panther. But long before Wakanda, East African artists were already dreaming up futures rooted in African cosmology, technology, and identity.\n\nAfrofuturism in East Africa isn't about copying Western sci-fi aesthetics and painting them in African colours. It's about drawing on indigenous knowledge systems, oral traditions, and spiritual practices to imagine futures that are authentically African.\n\n## The Pioneers\n\nArtists like Wanuri Kahiu, who directed *Pumzi*, one of the first African science fiction short films, have been pushing boundaries for over a decade. Her work imagines a post-apocalyptic Africa where water is scarce and communities must rebuild, drawing on themes of resilience that are deeply rooted in East African history.\n\nIn the visual arts, painters and sculptors across Nairobi, Kampala, and Dar es Salaam are creating works that blend traditional motifs with futuristic elements. Think Maasai beadwork patterns rendered in neon, or carved masks reimagined as space helmets.\n\n## A New Generation\n\nThe new generation of Afrofuturist artists is younger, bolder, and more connected. Social media has given them platforms that galleries couldn't. Instagram and TikTok have become virtual galleries where Afrofuturist aesthetics reach global audiences.\n\n## Why It Matters\n\nAfrofuturism isn't just an art movement; it's a political statement. By imagining African futures, these artists are asserting that Africa's story isn't finished. That we are not just subjects of history, but authors of the future.\n\nAnd that future doesn't look like Hollywood's version. It looks like us.`,
        coverImage: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=500&fit=crop",
        categoryId: visual.id,
        authorId: wanjiku.id,
        publishedAt: new Date('2026-05-10'),
        readTime: 5,
        tags: "Visual Arts,Afrofuturism,Contemporary Art",
        isFeatured: true,
        isPinned: false,
      },
      {
        title: "Why East African Literature Deserves a Global Spotlight",
        slug: "why-east-african-literature-deserves-a-global-spotlight",
        excerpt: "From Ngugi wa Thiong'o to Yvonne Adhiambo Owuor, East African writers have long produced world-class literature. It's time the world took notice.",
        content: `## A Rich Tradition\n\nFrom Ngugi wa Thiong'o to Yvonne Adhiambo Owuor, East African writers have long produced world-class literature. It's time the world took notice.\n\nEast African literature is having a moment. A new generation of writers, some still in their twenties, is producing work that is urgent, innovative, and unapologetically African.\n\n## The Elders\n\nThe foundation was laid decades ago. Ngugi wa Thiong'o's decision to write in Gikuyu rather than English was a radical act of cultural self-determination that continues to inspire. His novels remain essential reading for anyone who wants to understand Kenya's colonial and post-colonial experience.\n\n## The New Wave\n\nWriters like Yvonne Adhiambo Owuor (*Dust*), Muthoni Likimani (*Passbook Number F.47927*), and Peter Kimani (*Dance of the Jakaranda*) are building on this foundation while forging their own paths.\n\n## The Missing Piece\n\nWhat's still missing is infrastructure. East Africa lacks the publishing houses, literary agents, and distribution networks that Western markets take for granted. Many talented writers remain unpublished or are forced to seek opportunities abroad.\n\nBut change is coming. Literary festivals like the Kwani Open Mic in Nairobi and the Storymoja Festival are creating spaces for writers to connect with readers and with each other.`,
        coverImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=500&fit=crop",
        categoryId: books.id,
        authorId: wanjiku.id,
        publishedAt: new Date('2026-05-10'),
        readTime: 7,
        tags: "Books,Literature,East Africa,Ngugi",
        isFeatured: false,
        isPinned: false,
      },
      {
        title: "Kenya's Theatre Renaissance: From Stage to Streaming",
        slug: "kenyas-theatre-renaissance-from-stage-to-streaming",
        excerpt: "Kenyan theatre is experiencing a revival, blending traditional storytelling with modern technology to reach new audiences across the continent.",
        content: `## A Quiet Revolution\n\nKenyan theatre is experiencing a revival, blending traditional storytelling with modern technology to reach new audiences across the continent.\n\nFor years, Kenyan theatre existed in a bubble, confined to the Kenya National Theatre and a handful of university halls. The audiences were loyal but small. The funding was scarce. The future seemed uncertain.\n\n## The Turning Point\n\nThen came the pandemic, and with it, a forced experiment. Theatre companies that had never considered digital suddenly had no choice. They started livestreaming performances, recording plays, and building online audiences.\n\nWhat happened next surprised everyone: the audience was bigger than ever.\n\n## From Stage to Screen\n\nCompanies like Phoenix Players, Heartstrings, and the Festival of Creative Arts (FESTAC) discovered that their work could reach audiences in Mombasa, Kisumu, and even the diaspora, places where physical theatre tours were too expensive to mount.\n\n## The New Landscape\n\nToday, Kenyan theatre exists in a hybrid space. Live performances continue, but they're complemented by recordings, podcasts, and even TikTok adaptations. Playwrights are writing with both stage and screen in mind.\n\nThe challenge now is sustainability. Can this momentum be maintained? Can theatre companies monetise digital content effectively? Can they build the kind of loyal online following that music and comedy have enjoyed?`,
        coverImage: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&h=500&fit=crop",
        categoryId: theatre.id,
        authorId: otieno.id,
        publishedAt: new Date('2026-05-08'),
        readTime: 6,
        tags: "Theatre,Performance,Digital,Nairobi",
        isFeatured: false,
        isPinned: false,
      },
      {
        title: "Behind the Canvas: Interview with Contemporary Artist Wangechi Mutu",
        slug: "behind-the-canvas-interview-wangechi-mutu",
        excerpt: "The internationally acclaimed Kenyan-born artist shares her thoughts on identity, displacement, and the power of African imagination in contemporary art.",
        content: `## The Artist's Journey\n\nThe internationally acclaimed Kenyan-born artist shares her thoughts on identity, displacement, and the power of African imagination in contemporary art.\n\nWangechi Mutu is one of the most important contemporary artists working today. Born in Nairobi, based in New York, her work spans sculpture, collage, film, and performance, always probing the intersections of gender, race, and colonialism.\n\n## On Identity\n\n*"Being Kenyan is the foundation of everything I do,"* Mutu says. *"Even when I'm working in New York or London, my imagination is rooted in the landscapes, stories, and people of East Africa."*\n\nHer work often features hybrid female figures, part human, part animal, part machine, that challenge Western notions of beauty, femininity, and power.\n\n## On Displacement\n\nDisplacement is a recurring theme in Mutu's work, both literal and metaphorical. As an artist who has lived between cultures for decades, she understands what it means to carry multiple identities.\n\n*"Every Kenyan diaspora artist knows this feeling; you're never fully here or there. But that in-between space is where the most interesting art happens."*\n\n## On the Future\n\nMutu is optimistic about the future of African art, but cautious about the commodification of the continent's creativity.\n\n*"The world is hungry for African art right now, and that's exciting. But we have to be careful that we're not just feeding the market; we need to be feeding our own souls."*`,
        coverImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=500&fit=crop",
        categoryId: interviews.id,
        authorId: admin.id,
        publishedAt: new Date('2026-05-05'),
        readTime: 8,
        tags: "Interviews,Visual Arts,Wangechi Mutu,Contemporary Art",
        isFeatured: false,
        isPinned: false,
      },
      {
        title: "Why Kenyan Literature Needs Its Own Canon",
        slug: "why-kenyan-literature-needs-its-own-canon",
        excerpt: "The case for establishing a distinctly Kenyan literary tradition, one that centres our languages, our histories, and our ways of seeing the world.",
        content: `## Defining the Canon\n\nThe case for establishing a distinctly Kenyan literary tradition, one that centres our languages, our histories, and our ways of seeing the world.\n\nEvery major literary tradition has a canon: a body of works that are considered foundational, essential, and representative of a culture's finest achievements. English literature has Shakespeare, Austen, Dickens. American literature has Twain, Morrison, Baldwin.\n\nKenyan literature deserves the same.\n\n## What We Have\n\nKenya already has a rich literary heritage. Ngugi wa Thiong'o's *A Grain of Wheat* is widely considered one of the greatest African novels ever written. Grace Ogot's short stories brought Luo oral traditions into literary form. Meja Mwangi's urban novels captured the energy and chaos of post-independence Nairobi.\n\nBut a canon isn't just a list of great books. It's a framework for understanding a culture's intellectual history, its preoccupations, its debates, its evolution.\n\n## What's Missing\n\nThe problem is that Kenyan literature has been defined largely by Western academic institutions and publishing houses. The books that get studied in universities, reviewed in international publications, and promoted at book fairs are often those that align with Western expectations of what "African literature" should look like.\n\n## Building Our Own\n\nEstablishing a Kenyan literary canon means making deliberate choices about which works to centre, which voices to amplify, and which stories to tell about our literary history. It means reading Kenyan literature on its own terms, not as a subset of "African literature" or "postcolonial literature."`,
        coverImage: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=500&fit=crop",
        categoryId: books.id,
        authorId: wanjiku.id,
        publishedAt: new Date('2026-05-01'),
        readTime: 7,
        tags: "Books,Literature,Kenyan Canon,Cultural Policy",
        isFeatured: false,
        isPinned: false,
      },
      {
        title: "The Politics of Art: Who Gets to Decide What Kenyan Culture Looks Like?",
        slug: "the-politics-of-art-who-decides-kenyan-culture",
        excerpt: "From colonial-era cultural policies to modern funding structures, external forces have long shaped Kenyan artistic expression. It's time for a critical examination.",
        content: `## The Question of Power\n\nFrom colonial-era cultural policies to modern funding structures, external forces have long shaped Kenyan artistic expression. It's time for a critical examination.\n\nWho decides what counts as "Kenyan culture"? Who determines which artists get funding, which exhibitions get reviewed, which stories get told? These are not abstract questions; they have real consequences for who gets to be an artist and what art gets made.\n\n## Colonial Legacies\n\nThe British colonial administration didn't just exploit Kenya's resources; it attempted to reshape its culture. Traditional art forms were discouraged or commodified for tourist consumption. "Official" culture was defined by colonial authorities who had little understanding of or interest in the traditions they were governing.\n\nThese structures didn't disappear at independence. They morphed into new forms, government cultural policies, foreign aid programmes, NGO funding structures, that continue to shape artistic production.\n\n## The Funding Problem\n\nToday, much of the funding for Kenyan arts comes from foreign organisations: European cultural agencies, American foundations, international NGOs. This isn't inherently bad, these organisations have supported important work. But it creates a dynamic where artists must shape their work to fit external expectations and priorities.\n\n## A Way Forward\n\nThe solution isn't to reject foreign funding; it's to build alternatives. Kenyan corporations, private collectors, and individual patrons need to step up. Government funding for the arts needs to increase. And most importantly, Kenyan artists and cultural institutions need to be at the centre of decision-making about their own culture.`,
        coverImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=500&fit=crop",
        categoryId: opinion.id,
        authorId: wanjiku.id,
        publishedAt: new Date('2026-05-01'),
        readTime: 9,
        tags: "Opinion,Cultural Policy,Funding,Colonialism",
        isFeatured: false,
        isPinned: false,
      },
      {
        title: "The Rise of Gengetone: How Nairobi's Youth Are Redefining Kenyan Music",
        slug: "the-rise-of-gengetone-nairobis-youth-redefining-kenyan-music",
        excerpt: "From the clubs of Eastlands to global streaming platforms, gengetone has become the voice of a generation.",
        content: `## A Sound Born in the Streets\n\nFrom the clubs of Eastlands to global streaming platforms, gengetone has become the voice of a generation.\n\nGengetone emerged in the late 2010s as a distinctly Kenyan genre, a fusion of genge, dancehall, and Afrobeat, with lyrics delivered in Sheng, the Swahili-English street language of Nairobi's youth.\n\n## The Elements\n\nWhat makes gengetone unique is its rawness. The production is heavy on bass and percussion, designed for clubs and parties. The lyrics are unapologetically local, referencing Nairobi neighbourhoods, street culture, and the daily realities of young Kenyans.\n\n## The Artists\n\nPioneers like Ethic, Sailors, and Boondocks Gang paved the way, but the genre has evolved far beyond its origins. Today's gengetone artists are experimenting with R&B melodies, conscious lyrics, and cross-border collaborations.\n\n## The Global Reach\n\nThanks to streaming platforms, gengetone is no longer confined to Nairobi. It's being played in clubs across East Africa, featured on international playlists, and influencing artists in other genres.\n\n## The Criticism\n\nNot everyone is a fan. Some critics argue that gengetone glorifies substance abuse and superficiality. Others say it lacks the musical sophistication of older Kenyan genres like benga.\n\nThese criticisms aren't without merit, but they miss something important: gengetone is the sound of young Kenyans telling their own stories, in their own language, on their own terms. And that's always worth celebrating.`,
        coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=500&fit=crop",
        categoryId: music.id,
        authorId: otieno.id,
        publishedAt: new Date('2024-12-15'),
        readTime: 6,
        tags: "Music,Gengetone,Nairobi,Youth Culture",
        isFeatured: false,
        isPinned: false,
      },
      {
        title: "Theatre in Nairobi Is Having a Moment — But Can It Last?",
        slug: "theatre-in-nairobi-having-a-moment-can-it-last",
        excerpt: "From sold-out shows at the National Theatre to pop-up performances in warehouses, Nairobi's theatre scene is buzzing. But sustainability remains the big question.",
        content: `## The Moment\n\nFrom sold-out shows at the Kenya National Theatre to pop-up performances in warehouses and rooftop bars, Nairobi's theatre scene is buzzing with an energy that hasn't been seen in decades.\n\nThe numbers tell the story: ticket sales are up, new theatre companies are forming, and audiences that once treated theatre as an occasional outing are becoming regular attendees.\n\n## What's Driving It\n\nSeveral factors are converging. A new generation of playwrights and directors, many trained abroad, are bringing fresh perspectives and production values. Social media has made it easier to build audiences and create buzz. And Nairobi's growing middle class is hungry for cultural experiences beyond the club and the cinema.\n\n## The Challenges\n\nBut sustainability remains the big question. Venues are scarce and expensive. Ticket prices, while rising, still don't cover production costs. And the talent drain to film, TV, and content creation is real. Why struggle in theatre when you can earn ten times as much on a Netflix production?\n\n## What Needs to Happen\n\nFor Nairobi's theatre renaissance to last, it needs institutional support: government funding, corporate sponsorships, and dedicated venues. It also needs audiences to keep showing up, not just for the hot new show, but for the quiet Wednesday night production by a company nobody's heard of.\n\nThat's how scenes become movements. And that's how movements become institutions.`,
        coverImage: "https://images.unsplash.com/photo-1507924538821-5046c5933c3b?w=800&h=500&fit=crop",
        categoryId: theatre.id,
        authorId: otieno.id,
        publishedAt: new Date('2026-04-05'),
        readTime: 6,
        tags: "Theatre,Nairobi,Sustainability,Cultural Renaissance",
        isFeatured: false,
        isPinned: false,
      },
      {
        title: "The Mysterious Disappearance of Benga: Kenya's Original Pop Sound",
        slug: "the-mysterious-disappearance-of-benga-kenyas-original-pop-sound",
        excerpt: "Once the soundtrack of Kenya, benga music has faded from the mainstream. What happened, and can it make a comeback?",
        content: `## The Sound of a Nation\n\nOnce the soundtrack of Kenya, benga music has faded from the mainstream. What happened, and can it make a comeback?\n\nBenga is Kenya's original pop music. Born in the Luo communities of western Kenya in the 1960s, it blended traditional Luo rhythms with the electric guitar to create a sound that was unmistakably Kenyan, danceable, melodic, and deeply soulful.\n\n## The Golden Age\n\nIn its heyday, benga was everywhere. Artists like D.O. Misiani, Daniel Kamau, and Collela Mazee filled dance halls across the country. Benga wasn't just entertainment; it was the soundtrack of independence, of nationhood, of a young country finding its voice.\n\n## The Decline\n\nThe decline of benga is a story of many factors: the rise of rhumba and soukous from Congo, the emergence of gengetone and kapuka in the 2000s, the ageing of benga's audience, and the lack of investment in preserving and promoting the genre.\n\n## The Revival Attempt\n\nIn recent years, there have been attempts to revive benga. Young artists like Makadem and bands like Kiu have incorporated benga elements into their music. Cultural organisations have organised benga festivals and workshops.\n\nBut a full revival requires more than nostalgia. It needs young artists to engage with benga not as a museum piece, but as a living, evolving form, one that can incorporate new influences while staying true to its roots.`,
        coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=500&fit=crop",
        categoryId: music.id,
        authorId: otieno.id,
        publishedAt: new Date('2026-04-20'),
        readTime: 6,
        tags: "Music,Benga,Heritage,Music History",
        isFeatured: false,
        isPinned: false,
      },
    ]
  })

  // === EVENTS ===
  await db.event.createMany({
    data: [
      {
        title: "Nairobi International Jazz Festival 2026",
        description: "A celebration of jazz music featuring artists from across Africa and the diaspora. Three days of performances, workshops, and jam sessions.",
        date: new Date('2026-06-20'),
        venue: "Carnivore Grounds",
        city: "Nairobi",
        category: "Music",
        categoryId: music.id,
        imageUrl: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600&h=400&fit=crop",
        isFeatured: true,
        isPast: false,
      },
      {
        title: "East African Film Festival 2026",
        description: "Showcasing the best of East African cinema with screenings, panel discussions, and networking events for filmmakers.",
        date: new Date('2026-07-10'),
        venue: "Alliance Fran\u00e7aise",
        city: "Nairobi",
        category: "Film & Video",
        categoryId: film.id,
        imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=400&fit=crop",
        isFeatured: true,
        isPast: false,
      },
      {
        title: "Nairobi Poetry Slam Championship",
        description: "East Africa's premier poetry slam competition featuring spoken word artists from Kenya, Uganda, Tanzania and beyond.",
        date: new Date('2026-07-25'),
        venue: "Kenya National Theatre",
        city: "Nairobi",
        category: "Books & Literature",
        categoryId: books.id,
        imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=400&fit=crop",
        isFeatured: true,
        isPast: false,
      },
      {
        title: "Kenya Theatre Festival 2026",
        description: "A week-long celebration of Kenyan theatre featuring new works, classic revivals, and experimental performances.",
        date: new Date('2026-08-15'),
        venue: "Kenya National Theatre",
        city: "Nairobi",
        category: "Theatre & Performance",
        categoryId: theatre.id,
        imageUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&h=400&fit=crop",
        isFeatured: false,
        isPast: false,
      },
      {
        title: "Lamu Cultural Festival 2026",
        description: "Twenty years of celebrating Swahili heritage with dhow races, poetry, music, and traditional arts.",
        date: new Date('2026-11-20'),
        venue: "Lamu Old Town",
        city: "Lamu",
        category: "Creative Economy",
        categoryId: creative.id,
        imageUrl: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=600&h=400&fit=crop",
        isFeatured: false,
        isPast: false,
      },
      {
        title: "Kuona Artists Open Studio 2026",
        description: "An open day at Kuona Artists Collective giving the public a chance to meet artists, see works in progress, and buy art directly.",
        date: new Date('2026-03-15'),
        venue: "Kuona Trust",
        city: "Nairobi",
        category: "Visual Arts",
        categoryId: visual.id,
        imageUrl: "https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=600&h=400&fit=crop",
        isFeatured: false,
        isPast: true,
      },
    ]
  })

  // === SAMPLE COMMENTS ===
  const articles = await db.article.findMany({ select: { id: true } })
  await db.comment.createMany({
    data: [
      { articleId: articles[0].id, author: "Kamau N.", content: "This resonates deeply. I quit my accounting job last year to pursue music production full-time and haven't looked back. The ecosystem needs to catch up though; access to funding and equipment is still a major barrier." },
      { articleId: articles[0].id, author: "Amina J.", content: "Great piece. I'd love to see a follow-up on the specific policies being proposed. The idea of using music catalogues as collateral is fascinating." },
      { articleId: articles[1].id, author: "DJ Kioni", content: "The BAG changed Nairobi's nightlife. Period. No other event brings together such a diverse crowd with such good energy. Here's to many more years." },
      { articleId: articles[3].id, author: "Mutua K.", content: "Finally someone is writing about Afrofuturism beyond Black Panther. The work happening in Nairobi studios right now is incredible." },
    ]
  })

  console.log('Seed data created successfully!')
  console.log(`${categories.length} categories`)
  console.log(`${authors.length} authors`)
  console.log(`12 articles`)
  console.log(`6 events`)
  console.log(`4 comments`)
}

seed()
  .catch(console.error)
  .finally(() => db.$disconnect())
