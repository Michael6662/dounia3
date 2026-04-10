-- =============================================
-- DOUNIA — Script SQL de configuration Supabase
-- À exécuter dans Supabase > SQL Editor
-- =============================================

-- 1. TABLE PROFILES (utilisateurs)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  nom TEXT,
  role TEXT DEFAULT 'visiteur' CHECK (role IN ('visiteur', 'createur')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLE LIEUX
CREATE TABLE IF NOT EXISTS lieux (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  description TEXT,
  pays TEXT NOT NULL,
  categorie TEXT NOT NULL,
  url_image TEXT,
  embed_3d TEXT,
  createur_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  statut TEXT DEFAULT 'publie' CHECK (statut IN ('publie', 'en_attente')),
  nb_visites INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLE VISITES
CREATE TABLE IF NOT EXISTS visites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lieu_id UUID REFERENCES lieux(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLE FAVORIS
CREATE TABLE IF NOT EXISTS favoris (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lieu_id UUID REFERENCES lieux(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lieu_id)
);

-- 5. TABLE RATINGS
CREATE TABLE IF NOT EXISTS ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lieu_id UUID REFERENCES lieux(id) ON DELETE CASCADE,
  note INTEGER NOT NULL CHECK (note >= 1 AND note <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lieu_id)
);

-- 6. TABLE COMMENTAIRES
CREATE TABLE IF NOT EXISTS commentaires (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lieu_id UUID REFERENCES lieux(id) ON DELETE CASCADE,
  texte TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLE ABONNEMENTS (infrastructure future)
CREATE TABLE IF NOT EXISTS abonnements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT,
  debut TIMESTAMPTZ,
  fin TIMESTAMPTZ,
  montant INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABLE COMMISSIONS (infrastructure future)
CREATE TABLE IF NOT EXISTS commissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  createur_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lieu_id UUID REFERENCES lieux(id) ON DELETE CASCADE,
  montant INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TRIGGER : créer le profil automatiquement
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, nom, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nom', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'visiteur')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- RLS (Row Level Security)
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lieux ENABLE ROW LEVEL SECURITY;
ALTER TABLE visites ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoris ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE commentaires ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Profiles visibles par tous" ON profiles FOR SELECT USING (true);
CREATE POLICY "Profil modifiable par soi" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profil insérable" ON profiles FOR INSERT WITH CHECK (true);

-- Lieux
CREATE POLICY "Lieux visibles par tous" ON lieux FOR SELECT USING (true);
CREATE POLICY "Lieux insérables par créateurs" ON lieux FOR INSERT WITH CHECK (auth.uid() = createur_id);
CREATE POLICY "Lieux modifiables par créateur" ON lieux FOR UPDATE USING (auth.uid() = createur_id);
CREATE POLICY "Lieux supprimables par créateur" ON lieux FOR DELETE USING (auth.uid() = createur_id);

-- Visites
CREATE POLICY "Visites lisibles" ON visites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Visites insérables" ON visites FOR INSERT WITH CHECK (true);

-- Favoris
CREATE POLICY "Favoris lisibles" ON favoris FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Favoris insérables" ON favoris FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Favoris supprimables" ON favoris FOR DELETE USING (auth.uid() = user_id);

-- Ratings
CREATE POLICY "Ratings lisibles" ON ratings FOR SELECT USING (true);
CREATE POLICY "Ratings insérables" ON ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Ratings modifiables" ON ratings FOR UPDATE USING (auth.uid() = user_id);

-- Commentaires
CREATE POLICY "Commentaires lisibles" ON commentaires FOR SELECT USING (true);
CREATE POLICY "Commentaires insérables" ON commentaires FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Commentaires supprimables" ON commentaires FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- DONNÉES DE TEST — Lieux burkinabè
-- =============================================
INSERT INTO lieux (nom, description, pays, categorie, embed_3d, statut, nb_visites) VALUES
(
  'Ruines de Loropéni',
  'Les Ruines de Loropéni sont un site archéologique exceptionnel classé au patrimoine mondial de l''UNESCO depuis 2009. Ces ruines de pierres sèches constituent l''un des plus anciens et mieux préservés exemples d''architecture en Afrique de l''Ouest. Datant d''au moins 1000 ans, elles témoignent de l''apogée d''une civilisation mystérieuse liée au commerce de l''or.',
  'Burkina Faso', 'Site historique',
  'https://sketchfab.com/models/52d5b1578c33473c9b8013a980bc4da5/embed?autostart=1&ui_infos=0&ui_watermark=0',
  'publie', 12
),
(
  'Grande Mosquée de Bobo-Dioulasso',
  'Chef-d''œuvre de l''architecture soudanaise, la Grande Mosquée de Bobo-Dioulasso est l''un des exemples les plus remarquables de l''architecture en banco d''Afrique de l''Ouest. Construite au XIXe siècle, elle impressionne par ses tours coniques et ses murs ornés de poutres en bois. Un symbole fort de l''identité culturelle du Burkina Faso.',
  'Burkina Faso', 'Lieu de culte', NULL, 'publie', 8
),
(
  'Pics de Sindou',
  'Les Pics de Sindou sont une formation rocheuse spectaculaire composée de hautes falaises et de pitons rocheux sculptés par l''érosion au fil des millénaires. Ce site naturel extraordinaire dans la région des Cascades offre des paysages à couper le souffle et abrite une biodiversité remarquable. Un trésor géologique unique en Afrique de l''Ouest.',
  'Burkina Faso', 'Site naturel', NULL, 'publie', 6
),
(
  'Palais Royal de Tiébélé',
  'Le village de Tiébélé abrite le palais royal des chefs Kassena, célèbre pour ses maisons décorées de peintures géométriques multicolores. Ces décorations, réalisées exclusivement par les femmes, racontent l''histoire et les croyances du peuple Kassena. Un chef-d''œuvre vivant du patrimoine artistique africain.',
  'Burkina Faso', 'Monument', NULL, 'publie', 4
),
(
  'Marché Central de Ouagadougou',
  'Le marché central de Ouagadougou, appelé "Rood Woko", est le cœur battant de la capitale burkinabè. Un espace vibrant où se mêlent tissus wax, épices, artisanat traditionnel et vie quotidienne authentique. Une immersion totale dans la culture et l''économie populaire du Burkina Faso.',
  'Burkina Faso', 'Marché', NULL, 'publie', 3
)
ON CONFLICT DO NOTHING;
