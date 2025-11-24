import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Play } from 'lucide-react';
import { toast } from 'sonner';

interface PhotocardVideo {
  id: string;
  photocard_id: string;
  video_url: string;
  duration_seconds: number;
  created_at: string;
  photocards: {
    idol_name: string;
    concept: string;
    rarity: string;
    image_url: string;
  };
}

export function PhotocardVideoGallery() {
  const [videos, setVideos] = useState<PhotocardVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setIsLoading(true);
      const walletAddress = localStorage.getItem('walletAddress');
      
      if (!walletAddress) {
        toast.error('지갑을 연결해주세요');
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('photocard_videos')
        .select(`
          *,
          photocards (
            idol_name,
            concept,
            rarity,
            image_url
          )
        `)
        .eq('user_wallet', walletAddress)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setVideos(data || []);
    } catch (error) {
      console.error('비디오 로드 실패:', error);
      toast.error('비디오를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (videoUrl: string, idolName: string) => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `${idolName}_video_${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('비디오 다운로드를 시작합니다');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">비디오 클립을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground mb-2">생성된 비디오 클립이 없습니다</p>
        <p className="text-sm text-muted-foreground">포토카드에서 비디오를 생성해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">📹 뮤직비디오 클립 ({videos.length})</h2>
        <Button onClick={loadVideos} variant="outline" size="sm">
          새로고침
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-3">
                {selectedVideo === video.id ? (
                  <video
                    src={video.video_url}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center cursor-pointer bg-gradient-to-br from-primary/20 to-secondary/20"
                    onClick={() => setSelectedVideo(video.id)}
                  >
                    <Play className="w-12 h-12 text-white" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold truncate">{video.photocards.idol_name}</h3>
                  <Badge variant="secondary">{video.photocards.rarity}</Badge>
                </div>
                
                <p className="text-sm text-muted-foreground truncate">
                  {video.photocards.concept}
                </p>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedVideo(video.id)}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    재생
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(video.video_url, video.photocards.idol_name)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  {new Date(video.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
